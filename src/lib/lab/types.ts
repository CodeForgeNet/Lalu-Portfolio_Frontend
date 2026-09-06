export type Document = {
  id: string;
  title: string;
  version: string;
  kind: "implementation" | "sample";
  source: string;
  content: string;
};

export type Chunk = {
  id: string;
  documentId: string;
  heading: string;
  start: number;
  end: number;
  text: string;
};

export type Corpus = {
  version: string;
  documents: Document[];
  chunks: Chunk[];
};

export type RunSettings = { question: string; documentIds: string[]; topK: 2 | 4 | 6 };
export const stageIds = ["embed", "retrieve", "context", "generate"] as const;
export type StageId = (typeof stageIds)[number];
export type Status = "pending" | "running" | "complete" | "failed" | "cancelled";
export type Stage = { id: StageId; status: Status; input?: string; output?: string; durationMs?: number };
export type Passage = Chunk & { citationId: string; rank: number; score: number; title: string };
export type Citation = { id: string; chunkId: string; documentId: string };
export type Usage = { inputTokens?: number; outputTokens?: number; totalTokens?: number };

export type EventPayload =
  | { type: "start"; settings: RunSettings; corpusVersion: string; startedAt: string; embeddingModel: string; generationModel: string }
  | { type: "stage"; stage: Stage }
  | { type: "sources"; passages: Passage[] }
  | { type: "delta"; text: string }
  | { type: "done"; citations: Citation[]; warnings: string[]; usage?: Usage; totalDurationMs: number; generationModel: string }
  | { type: "error"; message: string; status: "failed" | "cancelled"; origin: "server" | "client" };
export type RunEvent = EventPayload & { runId: string; sequence: number; elapsedMs: number };

export type Run = {
  id: string;
  settings: RunSettings;
  corpusVersion: string;
  startedAt: string;
  embeddingModel: string;
  generationModel: string;
  status: Status;
  stages: Stage[];
  passages: Passage[];
  answer: string;
  citations: Citation[];
  warnings: string[];
  events: RunEvent[];
  usage?: Usage;
  totalDurationMs?: number;
  error?: string;
};
