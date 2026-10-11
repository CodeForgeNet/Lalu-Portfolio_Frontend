"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Play, ShieldCheck } from "lucide-react";
import type { Passage, Run } from "@/lib/lab/types";
import { fallbackFixtures, fallbackScenarios, type ReliabilityScenario } from "@/lib/reliability";
import { Answer, RunMetrics, Sources, Trace } from "./RunView";
import { useInvestigation } from "./useInvestigation";
import styles from "./workbench.module.css";

export default function ReliabilityLab({ scenarios = fallbackScenarios, offline = false }: { scenarios?: ReliabilityScenario[]; offline?: boolean }) {
  const investigation = useInvestigation();
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id || fallbackScenarios[0].id);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const scenario = scenarios.find(item => item.id === selectedId) || fallbackScenarios.find(item => item.id === selectedId) || fallbackScenarios[0];
  const fixtures = fallbackFixtures[scenario.id];
  const live = investigation.displayed;
  const guarded = live || (investigation.replay ? investigation.displayed : null) || fixtures.guarded;

  function run() {
    void investigation.start({ scenarioId: scenario.id, question: scenario.question, documentIds: scenario.documentIds, topK: scenario.topK }, "/api/lab/reliability/runs");
  }
  function download() {
    const payload = JSON.stringify({ schemaVersion: 1, scenario, naive: fixtures.naive, guarded }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `reliability-${scenario.id}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function source(passage: Passage) {
    setSelectedPassage(passage);
    requestAnimationFrame(() => document.getElementById("reliability-source-inspector")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  return <main id="main-content" tabIndex={-1} className={styles.workbench}>
    <Link href="/lab" className={styles.back}>← Back to the Lab</Link>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>AI reliability lab · Curated failure modes</span><h1>Break the answer.<br /><em>Inspect the guardrails.</em></h1><p>Run the same evidence through a deliberately weak recorded prompt and the guarded pipeline. Checks are transparent rules, not a universal safety score.</p></div>
      <button className={`${styles.button} ${styles.primary}`} disabled={offline || investigation.busy} onClick={run}><ShieldCheck size={15} /> {investigation.busy ? "Running guarded check" : "Run live guarded check"}</button>
    </header>

    {offline && <p className={styles.status} role="status">Live backend unavailable. Recorded naive and guarded runs remain available; reconnect backend to run the guarded pipeline.</p>}
    <p className={styles.how}><strong>How comparison works:</strong> the naive answer is a pre-recorded weak-prompt baseline loaded immediately. Clicking <em>Run live guarded check</em> sends this fixed scenario to the guarded pipeline. Compare its answer, citations, trace, and checks against that baseline.</p>
    <section className={styles.collection} aria-labelledby="scenario-title">
      <span className={styles.eyebrow}>Choose an incident</span><h2 id="scenario-title">What should fail?</h2>
      <div className={styles.suggestions} aria-label="Reliability scenarios">{scenarios.map(item => <button key={item.id} className={item.id === scenario.id ? styles.primary : styles.button} onClick={() => { setSelectedId(item.id); setSelectedPassage(null); investigation.exitReplay(); }} aria-pressed={item.id === scenario.id}>{item.title}</button>)}</div>
      <p className={styles.muted}>{scenario.threat}</p><p className={styles.small}>Fixed question: {scenario.question} · {scenario.documentIds.length} selected documents · corpus {scenario.corpusVersion}</p>
    </section>

    {investigation.error && <p role="alert" className={styles.error}>{investigation.error}</p>}
    {investigation.replay && <div className={styles.replayControls} aria-label="Recorded replay controls"><button className={styles.button} onClick={investigation.toggleReplay}>{investigation.playing ? "Pause" : "Play"}</button><button className={styles.button} onClick={investigation.stepReplay} disabled={investigation.replay.count >= investigation.replay.original.events.length}>Step</button><span className={styles.small}>Event {investigation.replay.count}/{investigation.replay.original.events.length}</span><button className={styles.iconButton} onClick={investigation.exitReplay} aria-label="Close replay"><span aria-hidden="true">×</span></button></div>}
    <section className={styles.comparison} aria-label="Naive and guarded comparison">
      <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Evidence-preserving comparison</span><h2>Naive versus guarded</h2></div><div className={styles.actionGroup}><button className={styles.iconButton} onClick={() => investigation.startReplay(fixtures.guarded, true)} aria-label="Replay guarded fixture" title="Replay guarded fixture"><Play size={15} /></button><button className={styles.iconButton} onClick={download} aria-label="Download reliability report" title="Download report"><Download size={15} /></button></div></div>
      <div className={styles.compareGrid}>
        <RunCard title="Recorded naive run" subtitle="Weak prompt · fixed observation" run={fixtures.naive} onSource={source} />
        <RunCard title={live ? "Live guarded run" : "Recorded guarded fallback"} subtitle={live ? "Current provider response" : "Replayable fixture · no model call"} run={guarded} onSource={source} />
      </div>
    </section>

    {live && <section className={styles.answerPanel} aria-label="Live execution trace"><Trace run={live} /><Sources run={live} onSource={source} /></section>}
    {selectedPassage && <PassageInspector passage={selectedPassage} onClose={() => setSelectedPassage(null)} />}
  </main>;
}

function RunCard({ title, subtitle, run, onSource }: { title: string; subtitle: string; run: Run; onSource: (passage: Passage) => void }) {
  return <article className={styles.compareCard}><h3>{title}</h3><p className={styles.small}>{subtitle}</p><Answer run={run} onSource={onSource} /><RunMetrics run={run} />{run.evaluation && <div className={styles.evaluation} aria-label="Transparent checks"><p className={styles.eyebrow}>Checks · {run.evaluation.passed ? "pass" : "fail"}</p>{run.evaluation.checks.map(check => <div key={check.id} className={styles.check}><span aria-hidden="true">{check.passed ? "✓" : "×"}</span><span><strong>{check.label}</strong><small>{check.evidence}</small></span></div>)}</div>}</article>;
}

function PassageInspector({ passage, onClose }: { passage: Passage; onClose: () => void }) {
  return <section id="reliability-source-inspector" className={styles.reader} aria-label="Selected evidence passage"><div className={styles.readerHeader}><span className={styles.eyebrow}>Selected evidence · {passage.citationId}</span><h2>{passage.title}</h2><p className={styles.small}>{passage.heading} · rank {passage.rank} · similarity {passage.score.toFixed(3)}</p><button className={styles.button} onClick={onClose}>Close passage</button></div><div className={styles.readerBody}><p>{passage.text}</p></div></section>;
}
