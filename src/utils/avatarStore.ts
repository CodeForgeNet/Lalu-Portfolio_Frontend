import { create } from "zustand";
import axios from "axios";
import { StateCreator } from "zustand";

// Types from Chat.tsx
type Message = {
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
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
  lastSources: Source[];
  setMessages: (messages: Message[]) => void;
  isQuotaExceeded: boolean; // New state for quota

  // Voice input state
  isListening: boolean;
  isProcessingVerbalQuery: boolean; // New state
  setIsListening: (isListening: boolean) => void;

  // Functions
  fetchInitialSuggestions: () => Promise<void>;
  submitQuery: (text: string) => Promise<void>;
  submitVerbalQuery: (text: string) => Promise<void>;
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
  lastSources: [],
  isQuotaExceeded: false, // Initialize new state

  // --- Mutators ---
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setIsListening: (isListening) => set({ isListening }),
  setCurrentAudioDataUri: (uri) => set({ currentAudioDataUri: uri }),
  setSpeechHandler: (handler) => set({ speechHandler: handler }),
  setMessages: (messages) => set({ messages }),

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
    } catch (error) {
      console.error("Error generating speech:", error);
      set({ isProcessingVerbalQuery: false }); // Also set to false on error
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
            'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY,
          },
        }
      );
      set({ suggestions: res.data?.suggestions || [] });
    } catch (error) {
      console.error("Error fetching initial suggestions:", error);
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
            'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY,
          },
        }
      );

      const assistantText =
        res.data?.text || "Sorry, I had an issue processing that.";
      const assistantMsg: Message = {
        role: "assistant",
        text: assistantText,
        ts: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        lastSources: res.data?.sources || [],
        suggestions: res.data?.suggestions || [],
      }));
    } catch (err: any) {
      if (err.response && err.response.data.error === "QUOTA_EXCEEDED") {
        set({ isQuotaExceeded: true });
        const errMsg: Message = {
          role: "assistant",
          text: "The daily API quota has been reached. Please try again tomorrow.",
          ts: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, errMsg] }));
      } else {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        const errMsg: Message = {
          role: "assistant",
          text: `Error: ${message}`,
          ts: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, errMsg] }));
      }
    } finally {
      set({ chatLoading: false });
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
            'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY,
          },
        }
      );

      const assistantText =
        res.data?.text || "Sorry, I had an issue processing that.";

      // Trigger TTS for the response
      generateSpeech(assistantText);
    } catch (err: any) {
      if (err.response && err.response.data.error === "QUOTA_EXCEEDED") {
        set({ isQuotaExceeded: true });
        generateSpeech("The daily API quota has been reached.");
      } else {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        // Optional: decide if you want verbal error feedback
        generateSpeech(`Error: ${message}`);
      }
    } finally {
      set({ loading: false }); // Only set loading to false here
    }
  },
});

const useAvatarStore = create<AvatarStore>(store);

export default useAvatarStore;
