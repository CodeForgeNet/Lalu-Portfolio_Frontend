import test from "node:test";
import assert from "node:assert/strict";
import { chunkDocument, buildContext, exportRun, interruptRun, reduceEvent, replayRun, selectPassages, validateCitations, validateSettings } from "../../src/lib/lab/core.ts";
import { executeRun } from "../../src/lib/lab/pipeline.ts";
import { ServiceError } from "../../src/lib/lab/providers.ts";
import { readSSE } from "../../src/lib/lab/sse.ts";
import { prepareCorpus } from "../../scripts/lab-corpus.ts";
import type { Provider } from "../../src/lib/lab/providers.ts";
import type { Document, RunEvent, RunSettings } from "../../src/lib/lab/types.ts";

const corpus = prepareCorpus();
const settings: RunSettings = { question: "Why did the sample create two jobs?", documentIds: ["webhook-incident"], topK: 4 };
const incident = corpus.chunks.find(c => c.documentId === "webhook-incident" && c.heading === "Observed sequence")!;
const cache = corpus.chunks.find(c => c.documentId === "portfolio-cache")!;
function provider(overrides: Partial<Provider> = {}): Provider {
  return {
    config: { embeddingModel: "test-embedding", generationModel: "test-generation", dimensions: 3 },
    async embed() { return [1, 0, 0]; },
    async retrieve() { return [{ id: incident.id, score: .8 }]; },
    async *generate(_question, context) { assert.ok(context.includes("job_701")); yield { text: "The sample discarded event identity. " }; yield { text: "[S1]", model: "test-generation-version", usage: { inputTokens: 10, outputTokens: 8 } }; },
    ...overrides,
  };
}
async function events(p = provider(), signal = new AbortController().signal): Promise<RunEvent[]> {
  return Array.fromAsync(executeRun(settings, corpus, p, signal));
}

test("corpus chunk offsets reproduce every original passage exactly", () => {
  for (const chunk of corpus.chunks) {
    const doc = corpus.documents.find(d => d.id === chunk.documentId)!;
    assert.equal(doc.content.slice(chunk.start, chunk.end), chunk.text);
    assert.ok(chunk.text.split(/\s+/).length <= 400);
    assert.ok(chunk.heading);
  }
  assert.equal(new Set(corpus.chunks.map(c => c.id)).size, corpus.chunks.length);
});

test("long paragraphs split at 400 words with 60 words of exact overlap", () => {
  const content = `# Test\n\n${Array.from({ length: 750 }, (_, i) => `word${i}`).join("  ")}\n\n## Next\n\nAnother paragraph.`;
  const doc: Document = { id: "long", title: "Long", version: "1", kind: "sample", source: "test", content };
  const chunks = chunkDocument(doc);
  assert.equal(chunks[0].text.split(/\s+/).length, 400);
  assert.deepEqual(chunks[0].text.split(/\s+/).slice(-60), chunks[1].text.split(/\s+/).slice(0, 60));
  assert.equal(chunks.at(-1)?.heading, "Next");
  for (const chunk of chunks) assert.equal(content.slice(chunk.start, chunk.end), chunk.text);
});

test("settings reject unknown documents, empty selection, invalid topK, and oversized questions", () => {
  for (const invalid of [null, {}, { ...settings, documentIds: [] }, { ...settings, documentIds: ["private"] }, { ...settings, topK: 100 }, { ...settings, question: "x".repeat(1501) }]) assert.throws(() => validateSettings(invalid, corpus));
  assert.deepEqual(validateSettings({ ...settings, documentIds: ["webhook-incident", "webhook-incident"] }, corpus).documentIds, ["webhook-incident"]);
});

test("remote matches cannot inject excluded, stale, duplicate, or unrecognized evidence", () => {
  const passages = selectPassages([{ id: cache.id, score: .99 }, { id: "stale-id", score: .97 }, { id: incident.id, score: .8 }, { id: incident.id, score: .7 }], corpus, settings);
  assert.equal(passages.length, 1);
  assert.equal(passages[0].documentId, "webhook-incident");
  assert.equal(passages[0].rank, 1);
  assert.equal(passages[0].text, incident.text);
  assert.ok(!buildContext(passages).includes("Redis"));
});

test("citations resolve only to supplied passages and unsupported answers are flagged", () => {
  const passages = selectPassages([{ id: incident.id, score: .8 }], corpus, settings);
  const checked = validateCitations("A claim [S1]. Invented source [S99]. Repeated [S1].", passages);
  assert.deepEqual(checked.citations.map(c => c.id), ["S1"]);
  assert.equal(checked.warnings.length, 1);
  assert.deepEqual(validateCitations("Grouped [S1, S99]", passages).citations.map(c => c.id), ["S1"]);
  assert.equal(validateCitations("Grouped [S1, S99]", passages).warnings.length, 1);
  assert.equal(validateCitations("There is no evidence for the requested latency.", passages).citations.length, 0);
  assert.ok(validateCitations("No evidence.", passages).warnings[0].includes("unsupported"));
});

test("pipeline sends sources before generation, captures measured stages and actual model identity", async () => {
  const log = await events();
  assert.deepEqual(log.map(e => e.sequence), log.map((_, i) => i));
  assert.equal(new Set(log.map(e => e.runId)).size, 1);
  assert.ok(log.findIndex(e => e.type === "sources") < log.findIndex(e => e.type === "delta"));
  const run = replayRun(log)!;
  assert.equal(run.status, "complete");
  assert.ok(run.stages.every(s => s.status === "complete" && s.durationMs! >= 0));
  assert.equal(run.generationModel, "test-generation-version");
  assert.equal(run.usage?.inputTokens, 10);
  assert.equal(run.citations[0].chunkId, incident.id);
});

test("pipeline checks exclusion again even when a retrieval provider returns the wrong document", async () => {
  let generated = false;
  const log = await events(provider({ async retrieve() { return [{ id: cache.id, score: 1 }]; }, async *generate() { generated = true; yield { text: "should not happen" }; } }));
  const run = replayRun(log)!;
  assert.equal(generated, false);
  assert.equal(run.status, "complete");
  assert.equal(run.passages.length, 0);
  assert.ok(run.answer.includes("did not return any evidence"));
  assert.equal(run.citations.length, 0);
});

test("provider failures retain partial output and mark unfinished stages failed", async () => {
  const run = replayRun(await events(provider({ async *generate() { yield { text: "Partial text" }; throw new ServiceError("Provider unavailable."); } })))!;
  assert.equal(run.status, "failed");
  assert.equal(run.answer, "Partial text");
  assert.equal(run.stages.find(s => s.id === "generate")?.status, "failed");
  assert.equal(run.stages.find(s => s.id === "retrieve")?.status, "complete");
  assert.equal(run.citations.length, 0);
});

test("unexpected service errors do not leak credentials or provider internals", async () => {
  const run = replayRun(await events(provider({ async embed() { throw new Error("secret-key-123 https://private.internal"); } })))!;
  assert.ok(!JSON.stringify(run).includes("secret-key-123"));
  assert.equal(run.status, "failed");
});

test("deadline expiry marks the run failed and does not claim a successful stage", async () => {
  const signal = AbortSignal.timeout(10);
  const log = await events(provider({ async embed(_text, abort) { await new Promise((_, reject) => { abort.addEventListener("abort", () => reject(abort.reason), { once: true }); setTimeout(() => reject(new Error("Test guard timeout")), 40); }); return []; } }), signal);
  const run = replayRun(log)!;
  assert.equal(run.status, "failed");
  assert.ok(run.error?.includes("45-second deadline"));
  assert.ok(run.stages.every(s => s.status !== "complete"));
});

test("cancellation propagates into an active provider call", async () => {
  const controller = new AbortController();
  const log = await events(provider({ async embed(_text, signal) { controller.abort(); signal.throwIfAborted(); return []; } }), controller.signal);
  const run = replayRun(log)!;
  assert.equal(run.status, "cancelled");
  assert.ok(run.stages.every(s => s.status === "cancelled"));
});

test("disconnected client traces are terminal and retry uses a new run ID", async () => {
  const first = await events();
  const second = await events();
  const incomplete = replayRun(first.slice(0, 3));
  const interrupted = interruptRun(incomplete, "Disconnected")!;
  assert.equal(interrupted.status, "failed");
  assert.notEqual(first[0].runId, second[0].runId);
  assert.equal(reduceEvent(interrupted, first.at(-1)!), interrupted);
});

test("replay reconstructs every stage and export preserves the original event log", async () => {
  const log = await events();
  const run = replayRun(log)!;
  for (let count = 1; count <= log.length; count++) {
    const partial = replayRun(log, count)!;
    assert.equal(partial.events.length, count);
    assert.equal(partial.answer, log.slice(0, count).filter(e => e.type === "delta").map(e => e.type === "delta" ? e.text : "").join(""));
  }
  const exported = JSON.parse(exportRun(run));
  assert.deepEqual(exported.events, log);
  assert.deepEqual(exported.settings, settings);
});

test("pinned baseline stays independent as another run changes settings and evidence", async () => {
  const baseline = replayRun(await events())!;
  const pinned = structuredClone(baseline);
  const otherSettings: RunSettings = { question: "Explain caching", documentIds: ["portfolio-cache"], topK: 2 };
  const log = await Array.fromAsync(executeRun(otherSettings, corpus, provider({ async retrieve() { return [{ id: cache.id, score: .9 }]; }, async *generate() { yield { text: "The cache uses similarity [S1]." }; } }), new AbortController().signal));
  const current = replayRun(log)!;
  assert.deepEqual(pinned, baseline);
  assert.notEqual(current.id, pinned.id);
  assert.notDeepEqual(current.passages, pinned.passages);
  assert.equal(current.settings.topK, 2);
});

test("SSE parsing survives byte fragmentation, CRLF, Unicode, comments and multiline data", async () => {
  const text = ': keepalive\r\ndata: {"text":\r\ndata: "café →"}\r\n\r\ndata: second\n\n';
  const bytes = new TextEncoder().encode(text);
  const stream = new ReadableStream<Uint8Array>({ start(controller) { for (const byte of bytes) controller.enqueue(Uint8Array.of(byte)); controller.close(); } });
  const messages = await Array.fromAsync(readSSE(stream));
  assert.deepEqual(messages, ['{"text":\n"café →"}', "second"]);
});

test("SSE parser rejects an unterminated final event", async () => {
  const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode('data: {"broken":')); controller.close(); } });
  await assert.rejects(Array.fromAsync(readSSE(stream)), /incomplete event/);
});
