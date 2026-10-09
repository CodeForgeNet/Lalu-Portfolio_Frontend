"use client";

import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";
import useChatStore from "@/utils/chatStore";
import PipelineTrace from "./PipelineTrace";
import { Send, Terminal } from "lucide-react";

type Message = {
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
  trace?: any;
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

  const {
    messages,
    chatLoading,
    suggestions,
    lastSources,
    fetchInitialSuggestions,
    submitQuery,
    isQuotaExceeded,
  } = useChatStore();

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  useEffect(() => {
    if (messages.length <= 1) {
      fetchInitialSuggestions();
    }
  }, [fetchInitialSuggestions, messages.length]);

  const handleSend = () => {
    if (!input.trim() || isQuotaExceeded || chatLoading) return;
    submitQuery(input);
    setInput("");
  };

  const components: Components = {
    a: ({ ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent-glow" />
    ),
    code: ({ ...props }) => (
      <code {...props} className="font-mono bg-surface p-1 rounded text-accent" />
    )
  };

  return (
    <div className="w-full border border-border bg-surface-2 rounded-lg overflow-hidden font-mono text-sm flex flex-col shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-muted">
          <Terminal size={14} />
          <span>NEURAL QUERY</span>
        </div>
        <div className="flex items-center gap-2 text-success text-xs">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="p-4 bg-surface-2">
        <p className="text-text-muted mb-4">Ask me anything about my experience or projects.</p>
        
        {/* Input Area */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-accent">{">"}</span>
          <input
            className="flex-1 bg-transparent border-none outline-none text-text placeholder-text-muted focus:ring-0"
            placeholder="What production AI systems have you built?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={chatLoading || isQuotaExceeded}
          />
          <button 
            onClick={handleSend}
            disabled={chatLoading || isQuotaExceeded || !input.trim()}
            className="text-text-muted hover:text-accent transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>

        {isQuotaExceeded && (
          <div className="text-error mb-4">
            [ERROR] API quota exceeded. Please try again tomorrow.
          </div>
        )}

        <div 
          ref={chatBoxRef}
          className="h-[400px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6"
        >
          {messages.slice(1).map((m: Message, i: number) => (
            <div key={i} className="flex flex-col gap-2">
              {m.role === "user" ? (
                <div className="text-text">
                  <span className="text-accent">{">"}</span> {m.text}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Pipeline Trace for Assistant Message */}
                  {m.trace && <PipelineTrace trace={m.trace} />}
                  
                  {/* Response content */}
                  <div>
                    <div className="text-text-muted mb-2 border-b border-border border-dashed pb-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis">── RESPONSE ────────────────────────────────────────────────────────</div>
                    <div className="prose prose-invert prose-sm max-w-none text-text font-sans break-words whitespace-pre-wrap overflow-hidden">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex flex-col gap-2">
              <PipelineTrace trace={null} isLoading={true} />
            </div>
          )}

          {/* Bottom Area: Sources, Suggestions, Avatar */}
          {messages.length > 1 && !chatLoading && (
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-end">
              <div className="flex flex-col gap-4 flex-1 pr-4">
                {lastSources.length > 0 && (
                  <div>
                    <div className="text-text-muted mb-1 text-xs">SOURCES</div>
                    <div className="flex flex-wrap gap-2">
                      {lastSources.map((s: Source, idx: number) => (
                        <span key={idx} className="text-xs text-accent">
                          {s.metadata?.title || s.title || `doc-${idx}`}
                          {s.score && ` [${Math.round(s.score * 100)}%]`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {suggestions.length > 0 && (
                  <div>
                    <div className="text-text-muted mb-1 text-xs">SUGGEST</div>
                    <div className="flex flex-col gap-2 mt-2">
                      {suggestions.map((s: string, idx: number) => {
                        const isHeading = idx === 0 && (s.toLowerCase().includes('here are') || !s.endsWith('?'));
                        return (
                        <button
                          key={idx}
                          onClick={() => !isHeading && submitQuery(s)}
                          className={`text-left text-sm text-text whitespace-normal flex items-start gap-2 ${isHeading ? 'cursor-default opacity-70' : 'cursor-pointer hover:text-accent transition-colors'}`}
                        >
                          {!isHeading && <span className="text-accent shrink-0">-</span>}
                          <span>{s}</span>
                        </button>
                      )})}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
