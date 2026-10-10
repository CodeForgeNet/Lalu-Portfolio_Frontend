import { create } from "zustand";
import type { TraceData, TraceStep } from "@/components/PipelineTrace";
import { readChatEvents } from "@/lib/chat/stream";
export type Message = {
  role: "user" | "assistant";
  text: string;
  id: string;
  trace?: TraceData;
  isStreaming?: boolean;
};
export type Source = {
  id: string;
  score?: number;
  title?: string;
  metadata?: { title?: string };
  text?: string;
};
const initialSuggestions = [
  "How does the portfolio assistant retrieve context?",
  "What can I inspect in the document workbench?",
  "Tell me about Lalu’s engineering experience.",
];
function sourcesFrom(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Source =>
        !!item && typeof item === "object" && typeof item.id === "string",
    )
    .map((item) => ({
      id: item.id,
      score:
        typeof item.score === "number" && Number.isFinite(item.score)
          ? item.score
          : undefined,
      title: typeof item.title === "string" ? item.title : undefined,
      metadata: {
        title:
          typeof item.metadata?.title === "string"
            ? item.metadata.title
            : undefined,
      },
      text: typeof item.text === "string" ? item.text : undefined,
    }));
}
interface ChatStore {
  messages: Message[];
  chatLoading: boolean;
  suggestions: string[];
  lastSources: Source[];
  error: string | null;
  submitQuery: (text: string) => Promise<void>;
}
const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  chatLoading: false,
  suggestions: initialSuggestions,
  lastSources: [],
  error: null,
  submitQuery: async (text) => {
    const question = text.trim();
    if (!question || question.length > 1500 || get().chatLoading) return;
    const id = crypto.randomUUID();
    set((state) => ({
      messages: [
        ...state.messages,
        { role: "user", text: question, id: crypto.randomUUID() },
        {
          role: "assistant",
          text: "",
          id,
          isStreaming: true,
          trace: { steps: [] },
        },
      ],
      chatLoading: true,
      suggestions: [],
      lastSources: [],
      error: null,
    }));
    const update = (change: (message: Message) => Message) =>
      set((state) => ({
        messages: state.messages.map((message) =>
          message.id === id ? change(message) : message,
        ),
      }));
    let completed = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);
    try {
      const response = await fetch("/api/ask-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, topK: 3 }),
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(response.status === 429 ? "RATE_LIMIT" : "UNAVAILABLE");
      if (
        !response.body ||
        !response.headers.get("content-type")?.includes("text/event-stream")
      )
        throw new Error("UNAVAILABLE");
      for await (const { event, data } of readChatEvents(response.body)) {
        if (event === "error") throw new Error("UNAVAILABLE");
        if (
          event === "step_start" &&
          typeof data.id === "string" &&
          typeof data.label === "string"
        ) {
          const step: TraceStep = {
            id: data.id,
            label: data.label,
            status: "running",
          };
          update((message) => ({
            ...message,
            trace: {
              ...message.trace,
              steps: [
                ...(message.trace?.steps || []).filter(
                  (item) => item.id !== step.id,
                ),
                step,
              ],
            },
          }));
        } else if (event === "step_complete" && typeof data.id === "string") {
          update((message) => ({
            ...message,
            trace: {
              ...message.trace,
              steps: (message.trace?.steps || []).map((step) =>
                step.id === data.id
                  ? {
                      ...step,
                      status: "complete",
                      durationMs:
                        typeof data.durationMs === "number" &&
                        Number.isFinite(data.durationMs) &&
                        data.durationMs >= 0
                          ? data.durationMs
                          : undefined,
                    }
                  : step,
              ),
            },
          }));
        } else if (event === "chunk" && typeof data.text === "string") {
          update((message) => ({ ...message, text: message.text + data.text }));
        } else if (event === "done") {
          if (
            !get()
              .messages.find((message) => message.id === id)
              ?.text.trim()
          )
            throw new Error("EMPTY");
          completed = true;
          update((message) => ({
            ...message,
            isStreaming: false,
            trace: {
              ...message.trace,
              steps: message.trace?.steps || [],
              isCached: data.cached === true,
            },
          }));
          set({
            lastSources: sourcesFrom(data.sources),
            suggestions: Array.isArray(data.suggestions)
              ? data.suggestions
                  .filter((item): item is string => typeof item === "string")
                  .slice(0, 3)
              : initialSuggestions,
          });
          break;
        }
      }
      if (!completed) throw new Error("INTERRUPTED");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "";
      const message =
        reason === "RATE_LIMIT"
          ? "The assistant is receiving too many requests. Please try again shortly."
          : "The assistant could not finish this response. Please retry, or explore the written case studies.";
      update((item) => ({
        ...item,
        isStreaming: false,
        trace: {
          ...item.trace,
          steps: (item.trace?.steps || []).map((step) =>
            step.status === "running" ? { ...step, status: "failed" } : step,
          ),
        },
      }));
      set({ error: message, suggestions: initialSuggestions });
    } finally {
      clearTimeout(timeout);
      set({ chatLoading: false });
    }
  },
}));
export default useChatStore;
