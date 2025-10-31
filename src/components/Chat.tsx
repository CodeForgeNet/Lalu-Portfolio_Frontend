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
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Tell me about your AI Course Generator",
    "What is your primary tech stack?",
    "Show me your most recent project",
  ];

  useEffect(() => {
    // Keep scroll at bottom when new messages arrive
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const postMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setLastSources([]);

    try {
      const res = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"
        }/api/ask`,
        {
          question: text,
          topK: 4,
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
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6 border border-gray-100 backdrop-blur-sm bg-opacity-95">
      <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        Chat with Lalu&apos;s portfolio
      </h3>

      <div
        ref={chatBoxRef}
        className="h-[500px] overflow-auto p-4 mb-4 bg-linear-to-br from-gray-50 to-white rounded-lg custom-scrollbar"
        style={{
          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block max-w-[85%] p-4 rounded-2xl shadow-sm transition-all duration-200 ${m.role === "user"
                  ? "bg-linear-to-r from-blue-500 to-blue-600 text-white"
                  : m.role === "assistant"
                  ? "bg-white border border-gray-100"
                  : "bg-gray-100"
                }`}
            >
              <div
                className={`text-xs mb-1 ${m.role === "user" ? "text-blue-100" : "text-gray-400"}`}
              >
                {m.role === "assistant" ? "AI Assistant" : m.role}
              </div>
              <div
                className={`prose wrap-break-word ${m.role === "user" ? "text-white" : "text-gray-700"}`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4">
            <div className="inline-block p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {lastSources.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">
            Sources & References
          </h4>
          <div className="flex flex-wrap gap-2">
            {lastSources.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-blue-50 text-xs text-blue-600 rounded-lg hover:bg-blue-100 cursor-help transition-colors duration-200 border border-blue-100"
                title={JSON.stringify(s.metadata, null, 2)}
              >
                {s.metadata?.title || s.id}{" "}
                {s.score ? `(${(s.score * 100).toFixed(0)}%)` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              className="px-4 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-100 hover:border-gray-200"
              onClick={() => postMessage(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            className="grow px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-700"
            placeholder="Ask about projects, experience, tech stack..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") postMessage(input);
            }}
          />
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 font-medium flex items-center gap-2 shadow-sm"
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
    </div>
  );
}


