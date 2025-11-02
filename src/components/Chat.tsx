"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";

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

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: "system",
      text: "You are talking to Lalu Kumar's portfolio assistant.",
      ts: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastSources, setLastSources] = useState<Source[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep scroll at bottom when new messages arrive
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    // Fetch initial suggestions when component mounts
    const fetchInitialSuggestions = async () => {
      try {
        const res = await axios.post(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"
          }/api/suggest`,
          {}
        );
        setSuggestions(res.data?.suggestions || []);
      } catch (error) {
        console.error("Error fetching initial suggestions:", error);
      }
    };
    fetchInitialSuggestions();
  }, []);

  const postMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setSuggestions([]); // Clear suggestions when a new question is asked

    try {
      setLastSources([]);
      const res = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"
        }/api/ask`,
        {
          question: text,
          topK: 3,
        }
      );

      const assistantText = res.data?.text || "Sorry, no response.";
      const assistantMsg: Message = {
        role: "assistant",
        text: assistantText,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Set sources from response
      const sources = res.data?.sources || [];
      setLastSources(sources);

      // Set new suggestions from response
      const suggestions = res.data?.suggestions || [];
      setSuggestions(suggestions);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      const errMsg: Message = {
        role: "assistant",
        text: `Error: ${message}`,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const components: Components = {
    a: ({ ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

  return (
    <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-xl p-6 mt-6 border border-slate-700/50 backdrop-blur-xl hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] -z-10"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-cyan-500/5 to-transparent rounded-xl"></div>

      <h3 className="text-2xl font-bold mb-4 text-transparent bg-linear-to-r from-teal-300 to-emerald-300 bg-clip-text flex items-center gap-2 relative">
        <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
        Chat with Lalu&apos;s portfolio
      </h3>

      <div
        ref={chatBoxRef}
        className="h-[500px] overflow-auto p-4 mb-4 rounded-lg custom-scrollbar relative bg-slate-900/50 backdrop-blur-sm"
        style={{
          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        {messages.map((m, i) => (
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
                {m.role === "assistant" ? "Lalu's Twin" : null}
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

        {loading && (
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
            {lastSources.map((source, idx) => (
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

      {suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-slate-300">
            Suggested Questions
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="px-4 py-2 text-sm bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 rounded-lg transition-colors duration-200 border border-slate-700/50 hover:border-slate-600/50 backdrop-blur-sm"
                onClick={() => postMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <input
          className="grow px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent placeholder:text-slate-500 text-slate-200 backdrop-blur-sm"
          placeholder="Ask about projects, experience, tech stack..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") postMessage(input);
          }}
        />
        <button
          className="px-6 py-3 bg-linear-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm backdrop-blur-sm"
          onClick={() => postMessage(input)}
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}
