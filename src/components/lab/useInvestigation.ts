"use client";

import { useEffect, useRef, useState } from "react";
import { interruptRun, reduceEvent, replayRun } from "@/lib/lab/core";
import { readSSE } from "@/lib/lab/sse";
import type { Run, RunEvent, RunSettings } from "@/lib/lab/types";

export function useInvestigation() {
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Run[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const [replay, setReplay] = useState<{ original: Run; count: number; recorded: boolean } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (!playing || !replay || replay.count >= replay.original.events.length) return;
    const events = replay.original.events;
    const previous = events[replay.count - 1]?.elapsedMs || 0;
    const delay = Math.max(0, events[replay.count].elapsedMs - previous) / speed;
    const timer = setTimeout(() => setReplay(value => value ? { ...value, count: Math.min(value.count + 1, value.original.events.length) } : null), delay);
    return () => clearTimeout(timer);
  }, [playing, replay, speed]);

  async function start(settings: RunSettings, endpoint = "/api/lab/runs") {
    if (abortRef.current) return;
    const abort = new AbortController();
    abortRef.current = abort;
    const timeout = setTimeout(() => abort.abort(new DOMException("Run deadline reached", "TimeoutError")), 45000);
    setBusy(true); setError(""); setRun(null); setReplay(null); setPlaying(false);
    let current: Run | null = null;
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings), signal: abort.signal });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Investigation failed (HTTP ${response.status}).`);
      }
      if (!response.body) throw new Error("The server returned no readable stream.");
      for await (const data of readSSE(response.body)) {
        const event = JSON.parse(data) as RunEvent;
        if ((!current && (event.type !== "start" || event.sequence !== 0)) || (current && (event.runId !== current.id || event.sequence !== current.events.length))) throw new Error("The execution stream arrived out of order. Please retry.");
        current = reduceEvent(current, event);
        setRun(current);
        if (event.type === "done" || event.type === "error") break;
      }
      if (!current || current.status === "running") throw new Error("The stream disconnected before the run completed. Please retry.");
      if (current.status === "complete") setHistory(previous => [current!, ...previous].slice(0, 8));
    } catch (cause) {
      const timedOut = abort.signal.reason?.name === "TimeoutError";
      const message = abort.signal.aborted ? timedOut ? "This run reached its 45-second deadline. Retry or explore the recorded run." : "Run cancelled." : cause instanceof Error ? cause.message : "The investigation could not finish.";
      current = interruptRun(current, message, abort.signal.aborted && !timedOut);
      setRun(current); setError(message);
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
      setBusy(false);
    }
  }

  function startReplay(original: Run, recorded = false) {
    if (abortRef.current) return;
    setError(""); setReplay({ original, recorded, count: 1 }); setPlaying(true);
  }

  const displayed = replay ? replayRun(replay.original.events, replay.count) : run;
  const replayEnded = !!replay && replay.count === replay.original.events.length;
  return { run, displayed, busy, error, history, replay, playing: playing && !replayEnded, speed, setSpeed, start, cancel: () => abortRef.current?.abort(), startReplay,
    toggleReplay: () => { if (replayEnded) setReplay(value => value ? { ...value, count: 1 } : null); setPlaying(replayEnded || !playing); },
    stepReplay: () => { setPlaying(false); setReplay(value => value ? { ...value, count: Math.min(value.count + 1, value.original.events.length) } : null); },
    exitReplay: () => { setReplay(null); setPlaying(false); },
  };
}
