"use client";

import { Fragment, useState } from "react";
import { ArrowRight, Check, Circle, Loader2 } from "lucide-react";
import type { Passage, Run, StageId } from "@/lib/lab/types";
import styles from "./workbench.module.css";

const stages: Record<StageId, { title: string; explanation: string }> = {
  embed: { title: "Embed question", explanation: "Represent this question as a numerical vector so related passages can be retrieved." },
  retrieve: { title: "Retrieve passages", explanation: "Search only the selected documents in this version of the collection. Scores describe vector similarity, not answer confidence." },
  context: { title: "Assemble evidence", explanation: "Resolve returned IDs to original document text. Only these passages enter the model's context." },
  generate: { title: "Generate answer", explanation: "Stream the model's response and validate its citation IDs against the supplied passages. A valid citation establishes provenance, not that the claim is correct." },
};

export function Answer({ run, onSource }: { run: Run; onSource: (passage: Passage) => void }) {
  const displayedAnswer = run.answer.replace(/\[(S\d+(?:\s*,\s*S\d+)*)\]/g, (_match, ids: string) => ids.split(/\s*,\s*/).map(id => `[${id}]`).join(" "));
  return <div className={styles.answer} aria-busy={run.status === "running"}>
    {run.answer ? displayedAnswer.split(/(\[S\d+\])/g).map((part, index) => {
      const passage = run.passages.find(p => `[${p.citationId}]` === part);
      const valid = passage && (run.status === "running" || run.citations.some(c => c.id === passage.citationId));
      return valid ? <button key={index} className={styles.citation} onClick={() => onSource(passage)} aria-label={`Open source ${passage.citationId}: ${passage.title}`}>{part}</button> : <Fragment key={index}>{part}</Fragment>;
    }) : <p className={styles.muted}>{run.status === "running" ? "The answer will appear as evidence reaches the model." : "No answer was produced."}</p>}
    {run.error && <p className={styles.error} role="alert">{run.error}</p>}
    {run.warnings.map(warning => <p className={styles.warning} key={warning}>{warning}</p>)}
  </div>;
}

export function RunMetrics({ run }: { run: Run }) {
  return <div className={styles.metrics}>
    <span>{run.status}</span>
    {run.totalDurationMs !== undefined && <span>{(run.totalDurationMs / 1000).toFixed(2)} s total</span>}
    {run.usage?.inputTokens !== undefined && <span>{run.usage.inputTokens} input tokens</span>}
    {run.usage?.outputTokens !== undefined && <span>{run.usage.outputTokens} output tokens</span>}
    <span>{run.generationModel}</span>
  </div>;
}

export function Trace({ run }: { run: Run | null }) {
  const [selected, setSelected] = useState<StageId>("retrieve");
  const current = run?.stages.find(stage => stage.id === selected);
  return <details className={styles.trace} open>
    <summary>Execution · inspect each stage</summary>
    <div className={styles.flow} aria-label="Execution stages">
      {(Object.keys(stages) as StageId[]).map((id, index) => {
        const stage = run?.stages.find(s => s.id === id);
        const status = stage?.status || "pending";
        return <Fragment key={id}>
          {index > 0 && <ArrowRight className={styles.connector} aria-hidden="true" size={16} />}
          <button className={`${styles.stage} ${selected === id ? styles.selected : ""}`} data-status={status} onClick={() => setSelected(id)} aria-pressed={selected === id}>
            {status === "running" ? <Loader2 className={styles.spinner} size={16} aria-hidden="true" /> : status === "complete" ? <Check size={16} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            <span>{stages[id].title}<small>{status}{stage?.durationMs !== undefined ? ` · ${stage.durationMs} ms` : ""}</small></span>
          </button>
        </Fragment>;
      })}
    </div>
    <p className={styles.muted}>{stages[selected].explanation}</p>
    <div className={styles.inspector}>
      <div><h4>Input</h4><pre>{current?.input || "Waiting for this stage to start."}</pre></div>
      <div><h4>Output</h4><pre>{current?.output || "No output yet."}</pre></div>
    </div>
  </details>;
}

export function Sources({ run, onSource }: { run: Run | null; onSource: (passage: Passage) => void }) {
  return <section className={styles.sources} aria-label="Retrieved evidence">
    <h3>Retrieved evidence <span className={styles.muted}>({run?.passages.length || 0})</span></h3>
    <p className={styles.small}>Scores measure retrieval similarity, not answer confidence.</p>
    {!run?.passages.length && <p className={styles.muted}>Passages appear here when retrieval completes.</p>}
    {run?.passages.map(p => <button key={p.id} className={styles.source} onClick={() => onSource(p)}>
      <span className={styles.sourceTop}><strong>[{p.citationId}] {p.title}</strong><span>#{p.rank} · {p.score.toFixed(3)}</span></span>
      <span className={styles.small}>{p.heading}</span>
      <span className={styles.excerpt}>{p.text}</span>
      <span className={styles.small}>Open passage →</span>
    </button>)}
  </section>;
}
