"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, RotateCcw, Sparkles } from "lucide-react";
import { analyzeMatch } from "@/lib/resume-match/core";
import { createNeedleClient } from "@/lib/resume-match/needleClient";
import { buildResumeEvidence, resumeExperienceYears } from "@/lib/resume-match/resume";
import type { MatchAnalysis } from "@/lib/resume-match/types";
import styles from "./resumeMatch.module.css";

const evidence = buildResumeEvidence();

export default function ResumeMatch() {
  const [jdText, setJdText] = useState("");
  const [status, setStatus] = useState("loading");
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [explanation, setExplanation] = useState<{ summary: string; strengths: string[]; gaps: string[]; interviewQuestions: string[] } | null>(null);
  const [explanationBusy, setExplanationBusy] = useState(false);
  const clientRef = useRef<ReturnType<typeof createNeedleClient> | null>(null);
  const canAnalyze = jdText.trim().length >= 200 && jdText.length <= 20_000 && status === "ready" && !busy;
  const characterLabel = useMemo(() => `${jdText.length.toLocaleString()} / 20,000 characters`, [jdText.length]);

  useEffect(() => {
    const client = createNeedleClient(setStatus, setError);
    clientRef.current = client;
    const clearRestoredState = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setJdText("");
        setAnalysis(null);
        setExplanation(null);
        client.clear();
      }
    };
    const clearOnExit = () => {
      setJdText("");
      setAnalysis(null);
      setExplanation(null);
      client.clear();
    };
    window.addEventListener("pageshow", clearRestoredState);
    window.addEventListener("pagehide", clearOnExit);
    return () => {
      window.removeEventListener("pageshow", clearRestoredState);
      window.removeEventListener("pagehide", clearOnExit);
      client.terminate();
    };
  }, []);

  async function runAnalysis() {
    setError("");
    setExplanation(null);
    if (jdText.trim().length < 200) return setError("Paste at least 200 characters from the job description.");
    if (jdText.length > 20_000) return setError("Job description is too long. Keep it under 20,000 characters.");
    setBusy(true);
    try {
      const result = await clientRef.current?.analyze(jdText, evidence);
      if (!result) throw new Error("Local analyzer is not ready.");
      setAnalysis(analyzeMatch(result.job, result.confidence, evidence, result.requirementEmbeddings, result.evidenceEmbeddings, resumeExperienceYears));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Local analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  function clearAnalysis() {
    setJdText("");
    setAnalysis(null);
    setExplanation(null);
    setError("");
    clientRef.current?.clear();
  }

  async function explain() {
    if (!analysis || explanationBusy) return;
    setExplanationBusy(true);
    setError("");
    try {
      const response = await fetch("/api/resume-match/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          roleTitle: analysis.job.roleTitle,
          score: analysis.score,
          breakdown: analysis.breakdown,
          matchedSkills: analysis.matched.slice(0, 20).map((item) => item.requirement),
          missingSkills: analysis.gaps.slice(0, 20).map((item) => item.requirement),
          resumeEvidence: analysis.matched.slice(0, 20).flatMap((item) => item.evidence),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI explanation unavailable.");
      setExplanation(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI explanation unavailable.");
    } finally {
      setExplanationBusy(false);
    }
  }

  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <Link href="/lab" className={styles.back}><ArrowLeft size={14} /> Back to the Lab</Link>
    <header className={styles.header}>
      <p className={styles.eyebrow}>Recruiter utility · Browser-local analysis</p>
      <h1>Paste a role.<br /><em>See the evidence.</em></h1>
      <p>Needle extracts requirements and compares them against my public engineering experience in your browser.</p>
    </header>

    <section className={styles.privacy} aria-label="Privacy notice">
      <strong>Private by default.</strong> Analysis runs in this browser. Nothing is saved. Refreshing or leaving this page clears the JD.
    </section>

    <section className={styles.workspace} aria-label="Resume match analyzer">
      <form className={styles.inputPanel} onSubmit={(event) => { event.preventDefault(); void runAnalysis(); }}>
        <label htmlFor="job-description">Job description</label>
        <textarea id="job-description" name="job-description" autoComplete="off" maxLength={20_000} value={jdText} disabled={busy} onChange={(event) => setJdText(event.target.value)} placeholder="Paste the role description here…" rows={16} />
        <div className={styles.inputMeta}><span>{characterLabel}</span><span>Needle status: {status}</span></div>
        <div className={styles.actions}>
          <button type="submit" className={styles.primary} disabled={!canAnalyze}>{busy ? "Analyzing locally…" : "Analyze fit"} <ArrowUpRight size={15} /></button>
          <button type="button" className={styles.secondary} onClick={clearAnalysis} disabled={!jdText && !analysis}><RotateCcw size={14} /> Clear</button>
        </div>
        {status === "loading" && <p className={styles.note} role="status">Loading local model. First load may take a moment.</p>}
        {status === "analyzing" && <p className={styles.note} role="status">Extracting requirements and comparing evidence locally.</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </form>

      <section className={styles.results} aria-live="polite" aria-label="Match results">
        {busy && <div className={styles.empty} aria-live="polite"><span className={styles.eyebrow}>Output</span><h2>Results stay in memory.</h2><p>Paste a detailed JD to see matched skills, evidence, gaps, and questions worth verifying.</p><GeneratingState /></div>}
        {!busy && !analysis && <div className={styles.empty}><span className={styles.eyebrow}>Output</span><h2>Results stay in memory.</h2><p>Paste a detailed JD to see matched skills, evidence, gaps, and questions worth verifying.</p></div>}
        {analysis && <>
          <div className={styles.scoreRow}><div><span className={styles.eyebrow}>Approximate portfolio fit</span><h2>{analysis.job.roleTitle}</h2><p className={styles.muted}>Extraction coverage: {Math.round(analysis.confidence * 100)}%</p></div><div className={styles.score} aria-label={analysis.score === null ? "Fit score unavailable out of 100" : `Fit score ${analysis.score} out of 100`}>{analysis.score === null ? "—" : `${analysis.score}`}<small>/100</small></div></div>
          {analysis.message && <p className={styles.warning}>{analysis.message}</p>}
          {analysis.score !== null && <div className={styles.breakdown}>{Object.entries(analysis.breakdown).map(([key, value]) => <div key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><b>{value}</b></div>)}</div>}
          <MatchList title="Matched" items={analysis.matched} />
          <MatchList title="Partial" items={analysis.partial} />
          <MatchList title="Missing or unverified" items={analysis.gaps} />
          <section className={styles.questions}><span className={styles.eyebrow}>Recruiter prompts</span><h3>Verify in interview</h3><ul>{(explanation?.interviewQuestions || analysis.interviewQuestions).map((item) => <li key={item}>{item}</li>)}</ul></section>
          {analysis.score !== null && <section className={styles.aiBox}><h3><Sparkles size={15} /> Optional AI explanation</h3><p>Only extracted role and match facts leave this browser. Original JD is never sent.</p>{!explanation && <button className={styles.secondary} onClick={() => void explain()} disabled={explanationBusy}>{explanationBusy ? "Generating…" : "Generate AI explanation"}</button>}{explanation && <><p>{explanation.summary}</p><h4>Strengths</h4><ul>{explanation.strengths.map((item) => <li key={item}>{item}</li>)}</ul><h4>Gaps</h4><ul>{explanation.gaps.map((item) => <li key={item}>{item}</li>)}</ul></>}</section>}
          <p className={styles.disclaimer}>This is an approximate portfolio fit signal, not an ATS result or hiring recommendation.</p>
        </>}
      </section>
    </section>
  </main>;
}

function MatchList({ title, items }: { title: string; items: MatchAnalysis["matched"] }) {
  if (!items.length) return null;
  return <section className={styles.matchList}><div className={styles.sectionHeading}><span className={styles.eyebrow}>{title}</span><span>{items.length}</span></div><ul>{items.map((item) => <li key={`${title}-${item.section}-${item.requirement}`}><strong>{item.requirement}</strong>{(item.evidence.length > 0 || item.section) && <small>{item.section ? `${item.section === "requiredSkills" ? "Required skill" : item.section === "preferredSkills" ? "Preferred skill" : item.section === "responsibilities" ? "Responsibility" : "Education"} · ` : ""}{item.evidence.join(" · ")}{item.evidenceText ? ` — ${item.evidenceText.slice(0, 150)}${item.evidenceText.length > 150 ? "…" : ""}` : ""}</small>}</li>)}</ul></section>;
}

function GeneratingState() {
  return <div className={styles.generating} role="status"><span className={styles.generatingMark} aria-hidden="true"><i /><i /><i /></span><span>Generating fit analysis</span></div>;
}
