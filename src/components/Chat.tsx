"use client";

import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";
import useAvatarStore from "@/utils/avatarStore";

// Define types here or import from store if they are exported
type Message = {
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
};

type Source = {
  id: string;
  score?: number;
  metadata?: { title?: string };
  text: string;
  title?: string;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Get state and actions from the global store
  const {
    messages,
    chatLoading,
    suggestions,
    lastSources,
    fetchInitialSuggestions,
    submitQuery,
    isQuotaExceeded,
  } = useAvatarStore();

  useEffect(() => {
    // Keep scroll at bottom when new messages arrive
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  useEffect(() => {
    // Fetch initial suggestions only if there are no messages yet
    if (messages.length <= 1) {
      fetchInitialSuggestions();
    }
  }, [fetchInitialSuggestions, messages.length]);

  const handleSend = () => {
    submitQuery(input);
    setInput("");
  };

  const components: Components = {
    a: ({ ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

  return (
    <>
      <h3 className="text-xl md:text-2xl font-semibold mb-4 text-transparent bg-linear-to-r from-green-300 to-sky-300 bg-clip-text flex items-center gap-3">
        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        Chat with Virtual Me
      </h3>

      <div
        ref={chatBoxRef}
        className="h-[400px] overflow-auto p-4 mb-4 rounded-lg custom-scrollbar relative bg-black/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
      >
        {messages.map((m: Message, i: number) => (
          <div
            key={i}
            className={`mb-4 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-4 rounded-xl transition-all duration-200 ${
                m.role === "user"
                  ? "inline-block max-w-[85%] bg-blue-500/15 border-l-4 border-blue-500 text-white"
                  : "w-full bg-white/5 border-l-4 border-green-500 text-slate-300"
              }`}
            >
              <div
                className={`text-xs mb-2 font-semibold ${
                  m.role === "user" ? "text-blue-200" : "text-green-300"
                }`}
              >
                {m.role === "assistant"
                  ? "Virtual Me"
                  : m.role === "system"
                  ? "System"
                  : "You"}
              </div>
              <div
                className={`prose prose-xs sm:prose-sm prose-invert wrap-break-word text-slate-200 text-xs sm:text-sm`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={components}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="mb-4 flex justify-start">
            <div className="inline-block p-4 bg-white/5 border-l-4 border-green-500 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:'0.2s']"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:'0.4s']"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {lastSources.length > 0 && (
        <div className="mb-6 relative z-20">
          <h4 className="text-sm font-semibold mb-2 text-green-300">
            Sources & References
          </h4>
          <div className="flex flex-wrap gap-2">
            {lastSources.map((source: Source, idx: number) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs sm:text-sm text-slate-300"
              >
                <div className="font-medium text-green-400 mb-1">
                  {source.metadata?.title || `Source ${idx + 1}`}
                  {source.score && ` (${(source.score * 100).toFixed(0)}%)`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && !chatLoading && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-slate-300">
            Suggested Questions
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s: string, idx: number) => (
              <button
                key={idx}
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs sm:text-sm text-slate-300 cursor-pointer transition-all duration-300 hover:bg-linear-to-r hover:from-blue-500 hover:to-green-500 hover:text-white hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => submitQuery(s)}
                disabled={isQuotaExceeded}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {isQuotaExceeded ? (
        <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
          The daily API quota has been reached. Please try again tomorrow.
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="grow px-4 py-3 bg-black/20 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent placeholder:text-slate-500 text-sm sm:text-base text-slate-200"
            placeholder="Ask about projects, experience, tech stack..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            className="px-4 py-2 bg-linear-to-r from-green-500 to-blue-500 text-white rounded-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-blue-500/50"
            onClick={handleSend}
            disabled={chatLoading || isQuotaExceeded}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span className="hidden lg:inline text-sm sm:text-base">Send</span>
          </button>
        </div>
      )}
    </>
  );
}
