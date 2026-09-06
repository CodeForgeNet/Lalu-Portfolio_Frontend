import { buildContext, selectPassages, validateCitations } from "./core.ts";
import { ServiceError } from "./providers.ts";
import type { Provider } from "./providers.ts";
import type { Corpus, EventPayload, RunEvent, RunSettings, StageId, Usage } from "./types.ts";

export async function* executeRun(settings: RunSettings, corpus: Corpus, provider: Provider, signal: AbortSignal, runId = crypto.randomUUID()): AsyncGenerator<RunEvent> {
  const started = performance.now();
  let sequence = 0;
  const event = (payload: EventPayload): RunEvent => ({ ...payload, runId, sequence: sequence++, elapsedMs: Math.round(performance.now() - started) });
  const begin = (id: StageId, input: string) => event({ type: "stage", stage: { id, status: "running", input } });
  const end = (id: StageId, since: number, output: string) => event({ type: "stage", stage: { id, status: "complete", durationMs: Math.round(performance.now() - since), output } });
  yield event({ type: "start", settings, corpusVersion: corpus.version, startedAt: new Date().toISOString(), embeddingModel: provider.config.embeddingModel, generationModel: provider.config.generationModel });
  try {
    signal.throwIfAborted();
    let stageStart = performance.now();
    yield begin("embed", settings.question);
    const vector = await provider.embed(settings.question, signal);
    signal.throwIfAborted();
    yield end("embed", stageStart, `${provider.config.embeddingModel}: ${vector.length} dimensions. First 8 values: ${vector.slice(0, 8).map(v => v.toFixed(5)).join(", ")}`);

    stageStart = performance.now();
    yield begin("retrieve", `Top ${settings.topK}; documents: ${settings.documentIds.join(", ")}; corpus ${corpus.version}`);
    const matches = await provider.retrieve(vector, settings, signal);
    signal.throwIfAborted();
    const passages = selectPassages(matches, corpus, settings);
    yield event({ type: "sources", passages });
    yield end("retrieve", stageStart, passages.map(p => `${p.citationId}: ${p.title} / ${p.heading} (${p.score.toFixed(4)})`).join("\n") || "No matching passages.");

    stageStart = performance.now();
    yield begin("context", `${passages.length} selected passages; no additional résumé or conversation context.`);
    const context = buildContext(passages);
    yield end("context", stageStart, context || "No evidence supplied.");

    stageStart = performance.now();
    yield begin("generate", passages.length ? `Question: ${settings.question}\n\nEvidence supplied to the model:\n${context}` : "No evidence; returning an explicit insufficient-evidence response without a model request.");
    let answer = "";
    let usage: Usage | undefined;
    let generationModel = provider.config.generationModel;
    if (passages.length) {
      for await (const chunk of provider.generate(settings.question, context, signal)) {
        signal.throwIfAborted();
        if (chunk.text) { answer += chunk.text; yield event({ type: "delta", text: chunk.text }); }
        if (chunk.usage) usage = chunk.usage;
        if (chunk.model) generationModel = chunk.model;
      }
    } else {
      answer = "The selected documents did not return any evidence for this question. Include another document or ask a question covered by this collection.";
      generationModel = "No model call — insufficient evidence";
      yield event({ type: "delta", text: answer });
    }
    signal.throwIfAborted();
    if (!answer.trim()) throw new ServiceError("The model returned an empty answer. Please retry.");
    const validation = validateCitations(answer, passages);
    yield end("generate", stageStart, `${generationModel}\n${answer}`);
    yield event({ type: "done", ...validation, usage, generationModel, totalDurationMs: Math.round(performance.now() - started) });
  } catch (error) {
    const timedOut = signal.aborted && signal.reason?.name === "TimeoutError";
    yield event({ type: "error", status: signal.aborted && !timedOut ? "cancelled" : "failed", origin: "server", message: timedOut ? "This run reached its 45-second deadline. Retry or explore the recorded run." : signal.aborted ? "Run cancelled." : error instanceof ServiceError ? error.message : "The investigation could not finish. Please retry or explore the recorded run." });
  }
}
