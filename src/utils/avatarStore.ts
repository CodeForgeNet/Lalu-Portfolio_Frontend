import { create } from "zustand";
import axios, { AxiosError } from "axios";
import { StateCreator } from "zustand";

// Types from Chat.tsx
type Message = {
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
  trace?: any;
  isStreaming?: boolean;
};

interface SourceMetadata {
  title?: string;
  type?: string;
  projectId?: string;
}

type Source = {
  id: string;
  score?: number;
  metadata?: SourceMetadata;
  text: string;
  title?: string;
};

type SpeechHandler = ((text: string) => Promise<string>) | null;

// Interface for expected backend error response
interface BackendErrorResponse {
  error?: string;
  message?: string;
}

interface AvatarStore {
  // Avatar speech state
  isSpeaking: boolean;
  currentAudioDataUri: string | null;
  speechHandler: SpeechHandler;
  setIsSpeaking: (speaking: boolean) => void;
  setCurrentAudioDataUri: (uri: string | null) => void;
  setSpeechHandler: (handler: SpeechHandler) => void;
  generateSpeech: (text: string) => Promise<string | null>;
  stopSpeaking: () => void;

  // Chat state
  messages: Message[];
  loading: boolean;
  chatLoading: boolean;
  suggestions: string[];
  suggestionSource: string | null;
  lastSources: Source[];
  setMessages: (messages: Message[]) => void;
  isQuotaExceeded: boolean; // New state for quota

  // Voice input state
  isListening: boolean;
  isProcessingVerbalQuery: boolean; // New state
  setIsListening: (isListening: boolean) => void;

  // Functions
  fetchInitialSuggestions: () => Promise<void>;
  setSuggestionSource: (src: string | null) => void;
  submitQuery: (text: string) => Promise<void>;
  submitVerbalQuery: (text: string) => Promise<void>;
}

// Type guard to check if an error is an AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

const store: StateCreator<AvatarStore> = (set, get) => ({
  // --- Initial State ---
  isSpeaking: false,
  isListening: false,
  isProcessingVerbalQuery: false, // Initialize new state
  currentAudioDataUri: null,
  speechHandler: null,
  messages: [
    {
      role: "system",
      text: "You are talking to Virtual me. Ask me anything!",
      ts: Date.now(),
    },
  ],
  loading: false,
  chatLoading: false,
  suggestions: [],
  suggestionSource: null,
  lastSources: [],
  isQuotaExceeded: false, // Initialize new state

  // --- Mutators ---
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setIsListening: (isListening) => set({ isListening }),
  setCurrentAudioDataUri: (uri) => set({ currentAudioDataUri: uri }),
  setSpeechHandler: (handler) => set({ speechHandler: handler }),
  setMessages: (messages) => set({ messages }),
  // optional: set suggestion source
  setSuggestionSource: (src: string | null) => set({ suggestionSource: src }),

  stopSpeaking: () => {
    set({ isSpeaking: false, currentAudioDataUri: null });
  },

  // --- Async Functions ---
  generateSpeech: async (text) => {
    const { speechHandler } = get();
    if (!speechHandler) {
      console.error("Speech handler not registered");
      return null;
    }
    try {
      // Remove markdown asterisks before sending to speech handler
      const cleanText = text.replace(/\*/g, ""); // Remove all asterisks
      const audioDataUri = await speechHandler(cleanText);
      set({
        currentAudioDataUri: audioDataUri,
        isProcessingVerbalQuery: false,
      }); // Set to false here
      return audioDataUri;
    } catch (error: unknown) {
      // Changed to unknown
      console.error("Error generating speech:", error);
      set({ isProcessingVerbalQuery: false });
      return null;
    }
  },

  fetchInitialSuggestions: async () => {
    try {
      const res = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"
        }/api/suggest`,
        {},
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY,
          },
        }
      );

      set({
        suggestions: res.data?.suggestions || [],
        suggestionSource: res.data?.source || null,
      });
    } catch (error: unknown) {
      // Changed to unknown
      console.error("Error fetching initial suggestions:", error);
      if (isAxiosError(error)) {
        if (
          error.response &&
          (error.response.data as BackendErrorResponse)?.error ===
            "QUOTA_EXCEEDED"
        ) {
          set({ isQuotaExceeded: true });
        }
        // Display the detailed error message in the chat
        let errorMessageText = `Error fetching initial suggestions: ${
          (error.response?.data as BackendErrorResponse)?.error ||
          error.message
        }`;

        if (error.response?.status === 503) {
          errorMessageText = "Error fetching initial suggestions: The AI model is currently overloaded. Please try again later.";
        }

        const errMsg: Message = {
          role: "system",
          text: errorMessageText,
          ts: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, errMsg] }));
      }
    }
  },

  submitQuery: async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text, ts: Date.now() };
    set((state) => ({
      messages: [...state.messages, userMsg],
      chatLoading: true,
      suggestions: [],
      lastSources: [],
    }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"}/api/ask-stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY || "",
          },
          body: JSON.stringify({ question: text, topK: 3 }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
           set({ isQuotaExceeded: true });
           throw new Error("QUOTA_EXCEEDED");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let assistantMsg: Message = {
        role: "assistant",
        text: "",
        ts: Date.now(),
        isStreaming: true,
        trace: { steps: [] }
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        chatLoading: false, // Turn off global loading since stream started
      }));

      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || ""; // Keep incomplete event in buffer

          for (const ev of events) {
            const eventMatch = ev.match(/^event: (.*?)\ndata: (.*)$/s);
            if (eventMatch) {
              const eventType = eventMatch[1];
              let eventData;
              try {
                eventData = JSON.parse(eventMatch[2]);
              } catch (e) {
                continue;
              }

              set((state) => {
                const msgs = [...state.messages];
                const lastIdx = msgs.length - 1;
                // Only update if the last message is ours
                if (msgs[lastIdx]?.isStreaming) {
                  const currentMsg = { ...msgs[lastIdx] };

                  if (eventType === 'step_start') {
                    currentMsg.trace = { ...currentMsg.trace };
                    currentMsg.trace.steps = [...(currentMsg.trace.steps || []), { ...eventData, status: 'running' }];
                  } else if (eventType === 'step_complete') {
                    currentMsg.trace = { ...currentMsg.trace };
                    currentMsg.trace.steps = (currentMsg.trace.steps || []).map((s: any) => 
                      s.id === eventData.id ? { ...s, ...eventData, status: 'complete' } : s
                    );
                  } else if (eventType === 'chunk') {
                    currentMsg.text += eventData.text;
                  } else if (eventType === 'done') {
                    currentMsg.isStreaming = false;
                    return {
                      messages: [...msgs.slice(0, lastIdx), currentMsg],
                      lastSources: eventData.sources || [],
                      suggestions: eventData.suggestions || []
                    };
                  } else if (eventType === 'error') {
                     currentMsg.isStreaming = false;
                     currentMsg.text = `Error: ${eventData.error}`;
                  }

                  msgs[lastIdx] = currentMsg;
                  return { messages: msgs };
                }
                return state;
              });
            }
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      const errMsg: Message = {
        role: "assistant",
        text: message === "QUOTA_EXCEEDED" ? "The daily API quota has been reached. Please try again tomorrow." : `Error: ${message}`,
        ts: Date.now(),
      };
      set((state) => ({ messages: [...state.messages, errMsg], chatLoading: false }));
    }
  },

  submitVerbalQuery: async (text: string) => {
    if (!text.trim()) return;

    const { generateSpeech } = get();
    set({ isProcessingVerbalQuery: true }); // Set to true here

    try {
      const res = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"
        }/api/ask`,
        {
          question: text,
          topK: 3,
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY,
          },
        }
      );

      const assistantText =
        res.data?.text || "Sorry, I had an issue processing that.";

      // Trigger TTS for the response
      generateSpeech(assistantText);
    } catch (err: unknown) {
      // Changed to unknown
      if (isAxiosError(err) && err.response) {
        const data = err.response.data as BackendErrorResponse | undefined;
        if (data?.error === "QUOTA_EXCEEDED") {
          set({ isQuotaExceeded: true });
          generateSpeech("The daily API quota has been reached.");
        } else {
          const message = isAxiosError(err)
            ? err.message
            : "An unknown error occurred";
          // Optional: decide if you want verbal error feedback
          generateSpeech(`Error: ${message}`);
        }
      } else {
        const message = isAxiosError(err)
          ? err.message
          : "An unknown error occurred";
        generateSpeech(`Error: ${message}`);
      }
    } finally {
      set({ loading: false }); // Only set loading to false here
    }
  },
});

const useAvatarStore = create<AvatarStore>(store);

export default useAvatarStore;
