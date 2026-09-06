"use client";

import { useEffect, useRef } from "react";
import type { Document, Passage } from "@/lib/lab/types";
import styles from "./workbench.module.css";

export function DocumentReader({ document, highlight }: { document: Document; highlight: Passage | null }) {
  const reader = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = reader.current?.querySelector<HTMLElement>("mark");
    target?.scrollIntoView({ block: "center", behavior: "instant" });
    target?.focus({ preventScroll: true });
  }, [document.id, highlight]);
  const blocks = [...document.content.matchAll(/\S[\s\S]*?(?=\n\s*\n|$)/g)];
  return <article className={styles.reader} ref={reader} aria-label={document.title}>
    <div className={styles.readerHeader}>
      <span className={styles.eyebrow}>{document.kind === "sample" ? "Synthetic engineering example" : "Observed repository implementation"} · v{document.version}</span>
      <h2>{document.title}</h2>
      <p className={styles.small}>{document.source}</p>
      {document.kind === "implementation" && <a className={styles.textLink} href={`https://github.com/CodeForgeNet/lalu-portfolio/blob/main/${document.source}`} target="_blank" rel="noreferrer">Source location in repository ↗</a>}
      {highlight?.documentId === document.id && <p className={styles.highlightLabel}>Selected evidence [{highlight.citationId}] · characters {highlight.start}–{highlight.end}</p>}
    </div>
    <div className={styles.readerBody}>
      {blocks.map(block => {
        const start = block.index!;
        const text = block[0];
        if (/^#{1,6} /.test(text)) return <h3 key={start}>{text.replace(/^#+ /, "")}</h3>;
        const active = highlight?.documentId === document.id && highlight.start < start + text.length && highlight.end > start;
        if (!active || !highlight) return <p key={start}>{text}</p>;
        const left = Math.max(0, highlight.start - start);
        const right = Math.min(text.length, highlight.end - start);
        return <p key={start}>{text.slice(0, left)}<mark tabIndex={-1}>{text.slice(left, right)}</mark>{text.slice(right)}</p>;
      })}
    </div>
  </article>;
}
