"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import useChatStore from "@/utils/chatStore";
import PipelineTrace from "./PipelineTrace";

export default function Chat() {
  const [input, setInput] = useState("");
  const {
    messages,
    chatLoading,
    suggestions,
    lastSources,
    error,
    submitQuery,
  } = useChatStore();
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  return (
    <div className="assistant-shell">
      <div className="assistant-heading">
        <h2>Portfolio assistant</h2>
        <span className="eyebrow">AI-generated answers</span>
      </div>
      <p className="assistant-description">
        Ask about my work. Inspect the retrieved context and execution trace.
        Responses may contain mistakes.
      </p>
      <div
        ref={log}
        className="chat-log"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        aria-busy={chatLoading}
        tabIndex={0}
      >
        {!messages.length && (
          <p className="assistant-description">
            Start with a question below, or choose a suggested topic.
          </p>
        )}
        {messages.map((message) => (
          <div className="chat-message" key={message.id}>
            <p className="eyebrow">
              {message.role === "user" ? "You" : "Assistant"}
            </p>
            {message.trace && (
              <PipelineTrace
                trace={message.trace}
                isLoading={message.isStreaming}
              />
            )}
            <div className="prose prose-invert prose-sm max-w-none break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: (props) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <p className="chat-status" role="status">
        {chatLoading
          ? "Receiving a response…"
          : messages.length && !error
            ? "Response complete."
            : "Ready for your question."}
      </p>
      {error && (
        <div role="alert" className="text-error text-sm mb-4">
          <p>{error}</p>
          <Link className="text-link" href="/projects">
            Read the case studies ↗
          </Link>
        </div>
      )}
      {lastSources.length > 0 && (
        <div className="chat-sources">
          <p className="eyebrow">
            Retrieved context · similarity is not confidence
          </p>
          {lastSources.map((source, index) => (
            <details key={`${source.id}-${index}`}>
              <summary>
                {source.metadata?.title || source.title || source.id}
                {source.score !== undefined
                  ? ` · similarity ${source.score.toFixed(3)}`
                  : ""}
              </summary>
              <p>{source.text || "This source returned no text excerpt."}</p>
            </details>
          ))}
        </div>
      )}
      <div className="chat-suggestions" aria-label="Suggested questions">
        {suggestions.map((question) => (
          <button
            key={question}
            disabled={chatLoading}
            onClick={() => void submitQuery(question)}
          >
            {question}
          </button>
        ))}
      </div>
      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (input.trim() && !chatLoading) {
            void submitQuery(input);
            setInput("");
          }
        }}
      >
        <label htmlFor="portfolio-question">Your question</label>
        <div>
          <input
            id="portfolio-question"
            name="question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="How does retrieval work here?"
            maxLength={1500}
            disabled={chatLoading}
            required
            autoComplete="off"
          />
          <button type="submit" disabled={chatLoading || !input.trim()}>
            Send ↗
          </button>
        </div>
      </form>
    </div>
  );
}
