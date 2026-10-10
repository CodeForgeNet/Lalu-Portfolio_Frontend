"use client";

import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Download, Pause, Play, Pin, SkipForward, Square, X } from "lucide-react";
import Link from "next/link";
import { exportRun } from "@/lib/lab/core";
import type { Corpus, Passage, Run, RunSettings } from "@/lib/lab/types";
import { DocumentReader } from "./DocumentReader";
import { Answer, RunMetrics, Sources, Trace } from "./RunView";
import { useInvestigation } from "./useInvestigation";
import styles from "./workbench.module.css";

const questions = [
  "Why did the sample incident create two jobs for one event, and what fixed it?",
  "What does a cache hit skip in the existing portfolio pipeline?",
  "What was the production p95 latency during the sample incident?",
];

export default function Workbench({ corpus, recorded, offline = false }: { corpus: Corpus; recorded: Run | null; offline?: boolean }) {
  const investigation = useInvestigation();
  const { displayed, busy, replay } = investigation;
  const [documentIds, setDocumentIds] = useState(corpus.documents.map(d => d.id));
  const [documentId, setDocumentId] = useState("webhook-incident");
  const [highlight, setHighlight] = useState<Passage | null>(null);
  const [question, setQuestion] = useState(questions[0]);
  const [topK, setTopK] = useState<RunSettings["topK"]>(4);
  const [tab, setTab] = useState("investigation");
  const [pinned, setPinned] = useState<Run | null>(null);
  const document = corpus.documents.find(d => d.id === documentId) || corpus.documents[0];

  function openPassage(passage: Passage) { setDocumentId(passage.documentId); setHighlight(passage); setTab("documents"); }
  function download(run: Run) {
    const url = URL.createObjectURL(new Blob([exportRun(run)], { type: "application/json" }));
    const link = window.document.createElement("a"); link.href = url; link.download = `investigation-${run.id}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function runInvestigation() { setHighlight(null); setTab("investigation"); void investigation.start({ question, documentIds, topK }); }
  const completed = displayed?.status === "complete" ? displayed : null;

  return <main id="main-content" tabIndex={-1} className={styles.workbench}>
    <Link href="/lab" className={styles.back}><ArrowLeft size={14} /> Back to the Lab</Link>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>Document investigation · Engineering workbench</span><h1>Follow the evidence.</h1><p>Ask a question. Inspect its sources. Change the evidence and compare what happens.</p></div>
      {recorded && <button className={styles.button} disabled={busy} onClick={() => { investigation.startReplay(recorded, true); setTab("investigation"); }}><Play size={14} /> Explore a recorded run</button>}
    </header>

    {offline && <p className={styles.status} role="status">The live backend is unavailable. You can read the bundled documents and explore the recorded run. Live investigation will be available when the backend reconnects.</p>}
    <details className={styles.how}>
      <summary>How this works & document preparation</summary>
      <p>These four Markdown documents were prepared before you arrived: split by headings and paragraphs, embedded, and indexed in a separate collection. Long passages use 400-word windows with 60 words of overlap. Source offsets point back to the original text.</p>
      <p>Each live run embeds your question, retrieves from only your selected documents, assembles that evidence, and streams a new answer. No résumé fallback or semantic answer cache is used. Citation links check source IDs; they do not automatically verify a claim. The two webhook documents are explicitly synthetic examples.</p>
      <p>Replay follows a captured event log without another model call. Runs stay in this tab&apos;s memory; download a report to keep one. The third suggested question intentionally asks for information this collection does not contain.</p>
      <p className={styles.small}>{corpus.documents.length} documents · {corpus.chunks.length} passages · corpus {corpus.version}</p>
    </details>

    <div className={styles.tabs} role="tablist" aria-label="Workbench views">
      {[{ id: "investigation", label: "Investigation" }, { id: "documents", label: "Documents" }].map(item => <button key={item.id} role="tab" aria-selected={tab === item.id} aria-controls={`${item.id}-panel`} id={`${item.id}-tab`} tabIndex={tab === item.id ? 0 : -1} onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { const next = item.id === "documents" ? "investigation" : "documents"; setTab(next); window.document.getElementById(`${next}-tab`)?.focus(); } }} onClick={() => setTab(item.id)}>{item.label}</button>)}
    </div>

    <div className={styles.workspace}>
      <section id="documents-panel" className={`${styles.documentPanel} ${tab !== "documents" ? styles.mobileHidden : ""}`} aria-label="Document collection">
        <fieldset className={styles.collection}>
          <legend>Evidence collection <span>{documentIds.length} selected</span></legend>
          {corpus.documents.map(doc => <div key={doc.id} className={`${styles.documentRow} ${doc.id === documentId ? styles.activeDocument : ""}`}>
            <input type="checkbox" checked={documentIds.includes(doc.id)} disabled={busy} aria-label={`Include ${doc.title}`} onChange={event => setDocumentIds(ids => event.target.checked ? [...ids, doc.id] : ids.filter(id => id !== doc.id))} />
            <button onClick={() => { setDocumentId(doc.id); setHighlight(null); }} aria-pressed={doc.id === documentId}><span>{doc.title}</span><small>{doc.kind === "sample" ? "Sample" : "Implementation"}</small></button>
          </div>)}
          <p className={styles.small}>Uncheck a document to exclude it from your next run. You can still read it.</p>
        </fieldset>
        <DocumentReader document={document} highlight={highlight} />
      </section>

      <section id="investigation-panel" className={`${styles.investigation} ${tab !== "investigation" ? styles.mobileHidden : ""}`} aria-label="Investigation">
        <form className={styles.questionForm} onSubmit={event => { event.preventDefault(); runInvestigation(); }}>
          <label htmlFor="investigation-question">Your question</label>
          <textarea id="investigation-question" value={question} maxLength={1500} rows={3} disabled={busy} onChange={event => setQuestion(event.target.value)} />
          <div className={styles.formActions}>
            <label htmlFor="retrieval-count">Retrieve <select id="retrieval-count" value={topK} disabled={busy} onChange={event => setTopK(Number(event.target.value) as RunSettings["topK"])}>{[2, 4, 6].map(count => <option key={count} value={count}>{count}</option>)}</select> passages</label>
            {busy ? <button type="button" className={styles.button} onClick={investigation.cancel}><Square size={13} /> Cancel run</button> : <button className={`${styles.button} ${styles.primary}`} disabled={offline || !question.trim() || !documentIds.length}>Run investigation <ArrowUpRight size={16} /></button>}
          </div>
          {!documentIds.length && <p className={styles.warning}>Select at least one document to run an investigation.</p>}
          <div className={styles.suggestions} aria-label="Suggested questions">{questions.map((q, index) => <button key={q} type="button" disabled={busy} onClick={() => setQuestion(q)}>{index === 0 ? "Investigate duplicate jobs" : index === 1 ? "Explain the cache" : "Try missing evidence"}</button>)}</div>
        </form>

        <div className={styles.status} role="status" aria-live="polite">{replay ? `${replay.recorded ? "Recorded replay" : "Replay"} · ${new Date(replay.original.startedAt).toLocaleString()} · no new AI request` : busy ? "Live run in progress. Stages update from server events." : displayed ? `Run ${displayed.status}.` : offline ? "Offline · Bundled documents and recorded replay are available." : "Ready · Every live run uses fresh retrieval and generation."}</div>
        {investigation.error && !displayed?.error && <p role="alert" className={styles.error}>{investigation.error}</p>}

        {replay && <div className={styles.replayControls}>
          <button className={styles.button} onClick={investigation.toggleReplay}>{investigation.playing ? <Pause size={14} /> : <Play size={14} />}{investigation.playing ? "Pause" : replay.count === replay.original.events.length ? "Restart" : "Play"}</button>
          <button className={styles.button} disabled={replay.count === replay.original.events.length} onClick={investigation.stepReplay}><SkipForward size={14} /> Step</button>
          <label>Speed <select aria-label="Replay speed" value={investigation.speed} onChange={event => investigation.setSpeed(Number(event.target.value))}>{[0.5, 1, 2, 4].map(speed => <option key={speed} value={speed}>{speed}×</option>)}</select></label>
          <span className={styles.small}>Event {replay.count}/{replay.original.events.length}</span>
          <button className={styles.iconButton} onClick={investigation.exitReplay} aria-label="Close replay"><X size={16} /></button>
        </div>}

        <Trace run={displayed} />
        <section className={styles.answerPanel} aria-label="Answer">
          <div className={styles.sectionHeading}><h2>Answer</h2>{completed && <div className={styles.actionGroup}>
            <button className={styles.iconButton} onClick={() => setPinned(structuredClone(completed))} aria-label="Pin run for comparison" title="Pin for comparison"><Pin size={15} /></button>
            <button className={styles.iconButton} onClick={() => investigation.startReplay(completed, !!replay?.recorded)} aria-label="Replay this run" title="Replay"><Play size={15} /></button>
            <button className={styles.iconButton} onClick={() => download(completed)} aria-label="Download run report" title="Download JSON report"><Download size={15} /></button>
          </div>}</div>
          {displayed ? <><p className={styles.small}>{displayed.settings.question} · top {displayed.settings.topK} · {displayed.settings.documentIds.length} documents</p><Answer run={displayed} onSource={openPassage} /><RunMetrics run={displayed} /></> : <p className={styles.muted}>Start with the duplicate-delivery incident. Then exclude that document and ask the same question again.</p>}
        </section>
        <Sources run={displayed} onSource={openPassage} />
      </section>
    </div>

    {pinned && <section className={styles.comparison} aria-label="Run comparison">
      <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Compare evidence and outcomes</span><h2>Pinned run & current run</h2></div><button className={styles.button} onClick={() => setPinned(null)}><X size={14} /> Unpin</button></div>
      <p className={styles.muted}>Change the selected documents or retrieval count, then run again. Timing differences are observations from individual runs, not a benchmark.</p>
      <div className={styles.compareGrid}>{[pinned, displayed && displayed.id !== pinned.id ? displayed : null].map((item, index) => <div key={index} className={styles.compareCard}>
        <h3>{index === 0 ? "Pinned baseline" : "Current experiment"}</h3>
        {item ? <><p>{item.settings.question}</p><p className={styles.small}>Top {item.settings.topK} · {item.settings.documentIds.map(id => corpus.documents.find(d => d.id === id)?.title).join(", ")}</p><p className={styles.small}>Corpus {item.corpusVersion} · {item.startedAt}</p><RunMetrics run={item} /><Answer run={item} onSource={openPassage} /><ul className={styles.compareSources}>{item.passages.map(p => <li key={p.id}><button onClick={() => openPassage(p)}>{p.title} / {p.heading} · {p.score.toFixed(3)} {index === 1 && !pinned.passages.some(old => old.id === p.id) ? "· added" : ""}</button></li>)}</ul>{index === 1 && pinned.passages.filter(old => !item.passages.some(p => p.id === old.id)).map(old => <p key={old.id} className={styles.small}>Removed: {old.title} / {old.heading}</p>)}</> : <p className={styles.muted}>Your next run will appear here.</p>}
      </div>)}</div>
    </section>}

    {investigation.history.length > 0 && <section className={styles.history} aria-label="Session run history"><h2>This session</h2><p className={styles.small}>The latest eight completed runs stay in memory until this page closes.</p>{investigation.history.map(run => <div key={run.id}><span>{run.settings.question}</span><span className={styles.small}>{run.totalDurationMs} ms · top {run.settings.topK}</span><button className={styles.textLink} disabled={busy} onClick={() => investigation.startReplay(run)}>Replay</button><button className={styles.textLink} onClick={() => setPinned(structuredClone(run))}>Pin</button><button className={styles.textLink} onClick={() => download(run)}>Download</button></div>)}</section>}
  </main>;
}
