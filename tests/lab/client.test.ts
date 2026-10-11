import test from "node:test";
import assert from "node:assert/strict";
import { interruptRun, reduceEvent, replayRun } from "../../src/lib/lab/core.ts";
import { readSSE } from "../../src/lib/lab/sse.ts";
import { fallbackFixtures } from "../../src/lib/reliability.ts";
import type { RunEvent, RunSettings } from "../../src/lib/lab/types.ts";

const settings: RunSettings = { question: "What changed?", documentIds: ["doc"], topK: 2 };
const events: RunEvent[] = [
  { type: "start", runId: "run-1", sequence: 0, elapsedMs: 0, settings, corpusVersion: "v1", startedAt: new Date().toISOString(), embeddingModel: "embed", generationModel: "generate" },
  { type: "delta", runId: "run-1", sequence: 1, elapsedMs: 10, text: "Answer [S1]" },
  { type: "done", runId: "run-1", sequence: 2, elapsedMs: 20, citations: [{ id: "S1", chunkId: "chunk", documentId: "doc" }], warnings: [], totalDurationMs: 20, generationModel: "generate" },
];

test("client reducer preserves ordered streamed events and replay", () => {
  const run = replayRun(events)!;
  assert.equal(run.status, "complete");
  assert.equal(run.answer, "Answer [S1]");
  assert.equal(run.events.length, 3);
  assert.equal(reduceEvent(run, events[1]), run);
});

test("client interruption makes an incomplete stream terminal", () => {
  const running = replayRun(events.slice(0, 2));
  const interrupted = interruptRun(running, "Disconnected")!;
  assert.equal(interrupted.status, "failed");
  assert.equal(interrupted.error, "Disconnected");
});

test("SSE parser handles fragmented frames", async () => {
  const bytes = new TextEncoder().encode('data: {"ok":true}\n\n');
  const stream = new ReadableStream<Uint8Array>({ start(controller) { for (const byte of bytes) controller.enqueue(Uint8Array.of(byte)); controller.close(); } });
  assert.deepEqual(await Array.fromAsync(readSSE(stream)), ['{"ok":true}']);
});

test("reliability fixtures preserve naive failure and guarded pass", () => {
  for (const fixture of Object.values(fallbackFixtures)) {
    assert.equal(fixture.naive.evaluation?.passed, false);
    assert.equal(fixture.guarded.evaluation?.passed, true);
  }
});
