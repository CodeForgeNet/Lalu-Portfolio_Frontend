import type { JobProfile, NeedleWorkerResponse, ResumeEvidence } from "./types";

type WorkerResult = { job: JobProfile; confidence: number; requirementEmbeddings: number[][]; evidenceEmbeddings: number[][] };

export function createNeedleClient(onStatus: (status: string) => void, onError: (message: string) => void) {
  const worker = new Worker("/needle/worker.js?v=20261012-9");
  let pending: { resolve: (result: WorkerResult) => void; reject: (error: Error) => void } | null = null;
  worker.onmessage = (event: MessageEvent<NeedleWorkerResponse>) => {
    const message = event.data;
    if (message.type === "status") onStatus(message.status);
    if (message.type === "error") {
      onError(message.message);
      pending?.reject(new Error(message.message));
      pending = null;
    }
    if (message.type === "result" && pending) {
      pending.resolve({ job: message.job, confidence: message.confidence, requirementEmbeddings: message.embeddings[0], evidenceEmbeddings: message.embeddings[1] });
      pending = null;
    }
  };
  worker.postMessage({ type: "init" });
  return {
    analyze(jdText: string, evidence: ResumeEvidence[]) {
        return new Promise<WorkerResult>((resolve, reject) => {
          pending = { resolve, reject };
          worker.postMessage({ type: "analyze", jdText, evidence });
      });
    },
    clear() { worker.postMessage({ type: "reset" }); },
    terminate() { worker.terminate(); }
  };
}
