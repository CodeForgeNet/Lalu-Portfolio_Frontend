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
      <h3 className="text-2xl font-bold mb-4 text-transparent bg-linear-to-r from-teal-300 to-emerald-300 bg-clip-text flex items-center gap-2 relative">
        <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
        Chat with Virtual me
      </h3>

      <div
        ref={chatBoxRef}
        className="h-[400px] overflow-auto p-4 mb-4 rounded-lg custom-scrollbar relative bg-slate-900/50 backdrop-blur-sm"
        style={{
          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        {messages.map((m: Message, i: number) => (
          <div
            key={i}
            className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block max-w-[85%] p-4 rounded-2xl shadow-sm transition-all duration-200 ${
                m.role === "user"
                  ? "bg-linear-to-r from-teal-600 to-emerald-600 text-white backdrop-blur-sm"
                  : m.role === "assistant"
                  ? "bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm"
                  : "bg-slate-800/50"
              }`}
            >
              <div
                className={`text-xs mb-1 ${
                  m.role === "user" ? "text-emerald-200" : "text-slate-400"
                }`}
              >
                {m.role === "assistant"
                  ? "Virtual me"
                  : m.role === "system"
                  ? "System"
                  : null}
              </div>
              <div
                className={`prose wrap-break-word ${
                  m.role === "user" ? "text-white text-left" : "text-slate-200"
                }`}
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
          <div className="mb-4">
            <div className="inline-block p-4 bg-slate-800/80 border border-slate-700/50 rounded-2xl shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {lastSources.length > 0 && (
        <div className="mb-6 relative z-20">
          <h4 className="text-sm font-semibold mb-2 text-emerald-200">
            Sources & References
          </h4>
          <div className="flex flex-wrap gap-2">
            {lastSources.map((source: Source, idx: number) => (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-2 text-sm text-slate-300"
              >
                <div className="font-medium text-emerald-300 mb-1">
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
                className="px-4 py-2 text-sm bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 rounded-lg transition-colors duration-200 border border-slate-700/50 hover:border-slate-600/50 backdrop-blur-sm"
                onClick={() => submitQuery(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1">
        <input
          className="grow px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent placeholder:text-slate-500 text-slate-200 backdrop-blur-sm"
          placeholder="Ask about projects, experience, tech stack..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className="px-2 py-2 bg-linear-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm backdrop-blur-sm"
          onClick={handleSend}
          disabled={chatLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          <span className="hidden lg:inline">Send</span>
        </button>
      </div>
    </>
  );
}
