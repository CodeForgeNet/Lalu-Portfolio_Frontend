import { stageIds } from "./types.ts";
import type { Chunk, Citation, Corpus, Document, Passage, Run, RunEvent, RunSettings } from "./types.ts";

/** Offsets always index the original Markdown, including whitespace. */
export function chunkDocument(doc: Document): Chunk[] {
  const result: Chunk[] = [];
  let heading = doc.title;
  for (const match of doc.content.matchAll(/[^\n]+(?:\n(?!\s*\n|#{1,6} ).+)*/g)) {
    const text = match[0];
    if (/^#{1,6} /.test(text)) {
      heading = text.split("\n")[0].replace(/^#+ /, "");
      // Heading-only blocks belong to metadata, not retrieval passages.
      if (!text.includes("\n")) continue;
    }
    const words = [...text.matchAll(/\S+/g)];
    for (let i = 0; i < words.length;) {
      const last = Math.min(i + 400, words.length) - 1;
      const start = match.index! + words[i].index!;
      const end = match.index! + words[last].index! + words[last][0].length;
      result.push({ id: `${doc.id}-${start}-${end}`, documentId: doc.id, heading, start, end, text: doc.content.slice(start, end) });
      if (last === words.length - 1) break;
      i += 340;
    }
  }
  return result;
}

export function validateSettings(value: unknown, corpus: Corpus): RunSettings {
  if (!value || typeof value !== "object") throw new Error("Provide a question and selected documents.");
  const body = value as Record<string, unknown>;
  if (typeof body.question !== "string" || !body.question.trim() || body.question.length > 1500) throw new Error("Enter a question between 1 and 1,500 characters.");
  if (!Array.isArray(body.documentIds) || !body.documentIds.length || body.documentIds.length > corpus.documents.length || body.documentIds.some(id => typeof id !== "string" || !corpus.documents.some(doc => doc.id === id))) throw new Error("Select at least one document from this collection.");
  if (body.topK !== 2 && body.topK !== 4 && body.topK !== 6) throw new Error("Retrieval count must be 2, 4, or 6.");
  return { question: body.question.trim(), documentIds: [...new Set(body.documentIds as string[])].sort(), topK: body.topK };
}

/** Resolve remote IDs against the local versioned corpus; never trust remote text. */
export function selectPassages(matches: { id: string; score?: number }[], corpus: Corpus, settings: RunSettings): Passage[] {
  const allowed = new Set(settings.documentIds);
  const seen = new Set<string>();
  const passages: Passage[] = [];
  for (const match of matches) {
    const chunk = corpus.chunks.find(c => c.id === match.id);
    if (!chunk || !allowed.has(chunk.documentId) || seen.has(chunk.id) || !Number.isFinite(match.score)) continue;
    seen.add(chunk.id);
    passages.push({ ...chunk, citationId: `S${passages.length + 1}`, rank: passages.length + 1, score: match.score!, title: corpus.documents.find(d => d.id === chunk.documentId)!.title });
    if (passages.length === settings.topK) break;
  }
  return passages;
}

export function buildContext(passages: Passage[]): string {
  return passages.map(p => `[${p.citationId}] ${p.title} / ${p.heading}\n${p.text}`).join("\n\n");
}

export function validateCitations(answer: string, passages: Passage[]): { citations: Citation[]; warnings: string[] } {
  const ids = [...new Set([...answer.matchAll(/\[(S\d+(?:\s*,\s*S\d+)*)\]/g)].flatMap(m => m[1].split(/\s*,\s*/)))];
  const citations: Citation[] = [];
  const warnings: string[] = [];
  for (const id of ids) {
    const passage = passages.find(p => p.citationId === id);
    if (passage) citations.push({ id, chunkId: passage.id, documentId: passage.documentId });
    else warnings.push(`[${id}] does not refer to supplied evidence.`);
  }
  if (!citations.length) warnings.push("No supporting citations were supplied. Treat this answer as unsupported or an indication of insufficient evidence.");
  return { citations, warnings };
}

export function reduceEvent(run: Run | null, event: RunEvent): Run | null {
  if (event.type === "start") {
    if (run) return run;
    return { id: event.runId, settings: event.settings, corpusVersion: event.corpusVersion, startedAt: event.startedAt, embeddingModel: event.embeddingModel, generationModel: event.generationModel, status: "running", stages: stageIds.map(id => ({ id, status: "pending" })), passages: [], answer: "", citations: [], warnings: [], events: [event] };
  }
  if (!run || run.id !== event.runId || run.status !== "running" || event.sequence !== run.events.length) return run;
  const next = { ...run, events: [...run.events, event] };
  switch (event.type) {
    case "stage": next.stages = run.stages.map(s => s.id === event.stage.id ? { ...s, ...event.stage } : s); break;
    case "sources": next.passages = event.passages; break;
    case "delta": next.answer += event.text; break;
    case "done": Object.assign(next, { status: "complete", citations: event.citations, warnings: event.warnings, usage: event.usage, totalDurationMs: event.totalDurationMs, generationModel: event.generationModel }); break;
    case "error":
      next.status = event.status;
      next.error = event.message;
      next.totalDurationMs = event.elapsedMs;
      next.stages = run.stages.map(s => s.status === "running" || s.status === "pending" ? { ...s, status: event.status } : s);
  }
  return next;
}

export function replayRun(events: RunEvent[], count = events.length): Run | null {
  return events.slice(0, count).reduce<Run | null>(reduceEvent, null);
}

export function interruptRun(run: Run | null, message: string, cancelled = false): Run | null {
  if (!run || run.status !== "running") return run;
  return reduceEvent(run, { type: "error", runId: run.id, sequence: run.events.length, elapsedMs: Math.max(run.events.at(-1)?.elapsedMs ?? 0, Date.now() - Date.parse(run.startedAt)), message, status: cancelled ? "cancelled" : "failed", origin: "client" });
}

export function exportRun(run: Run): string {
  return JSON.stringify({ schemaVersion: 1, ...run }, null, 2);
}
