import type { Metadata } from "next";
import Link from "next/link";
import Assistant from "@/components/portfolio/Assistant";
export const metadata: Metadata = {
  title: "The lab",
  description:
    "Explore the portfolio assistant and document investigation workbench. Inspect retrieval, evidence, streaming, and replay.",
  alternates: { canonical: "/lab" },
};
export default function LabPage() {
  return (
    <main className="shell page-body" id="main-content" tabIndex={-1}>
      <header className="page-intro">
        <p className="eyebrow">Applied AI Systems Lab / Interactive work</p>
        <h1>
          Open the box.
          <br />
          <em>Inspect what happens.</em>
        </h1>
        <p>
          Two ways to explore the engineering: ask about my work, or follow a
          document investigation from evidence to answer.
        </p>
      </header>
      <section className="lab-feature lab-page-feature" aria-labelledby="evidence-feature-title">
        <div>
          <p className="eyebrow">01 / Document ingestion + evidence</p>
          <h2 id="evidence-feature-title">
            Change the evidence.
            <br />
            <em>See what survives.</em>
          </h2>
          <p>
            Start with a prepared document collection, inspect the passages
            selected for a question, then remove a source and compare the
            answer. Every run keeps its evidence trail.
          </p>
          <Link className="button-primary" href="/lab/documents">
            Open the evidence workbench <span aria-hidden="true">↗</span>
          </Link>
          <Link className="text-link" href="/lab/reliability">
            Break an AI answer ↗
          </Link>
        </div>
        <div className="evidence-graphic" aria-label="Evidence workbench flow">
          <div className="evidence-line">
            <span>01</span> SELECT SOURCE DOCUMENTS <b>↘</b>
          </div>
          <div className="evidence-line">
            <span>02</span> RETRIEVE TRACEABLE PASSAGES <b>↘</b>
          </div>
          <div className="evidence-line">
            <span>03</span> COMPARE, REPLAY, EXPORT <b>↗</b>
          </div>
          <p>Prepared corpus · source offsets · recorded run</p>
        </div>
      </section>
      <section className="lab-feature lab-page-feature" aria-labelledby="resume-match-title">
        <div>
          <p className="eyebrow">02 / Browser-local recruiter utility</p>
          <h2 id="resume-match-title">Paste a role.<br /><em>See the evidence.</em></h2>
          <p>Compare a job description with my public engineering experience locally. JD text stays in the browser and disappears when you leave.</p>
          <Link className="button-primary" href="/lab/resume-match">Open the resume match analyzer <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="evidence-graphic" aria-label="Resume match flow">
          <div className="evidence-line"><span>01</span> EXTRACT ROLE REQUIREMENTS <b>↘</b></div>
          <div className="evidence-line"><span>02</span> COMPARE LOCAL EVIDENCE <b>↘</b></div>
          <div className="evidence-line"><span>03</span> SHOW MATCHES, GAPS, QUESTIONS <b>↗</b></div>
          <p>Needle WASM · no Pinecone · memory only</p>
        </div>
      </section>
      <div className="lab-layout">
        <section id="assistant" aria-label="Portfolio assistant">
          <Assistant />
        </section>
        <aside className="lab-aside">
          <div>
            <p className="eyebrow">03 / Portfolio assistant</p>
            <h2>Ask about the work</h2>
            <p>
              Ask a question and inspect the retrieved context and execution
              trace. This is the conversational surface; the workbench above
              is where evidence can be changed deliberately.
            </p>
            <Link className="text-link" href="#assistant">
              Try the assistant ↓
            </Link>
          </div>
          <div>
            <p className="eyebrow">04 / Read the implementation</p>
            <h2>Behind the assistant</h2>
            <p>
              Explore the request path, semantic cache trade-offs, and the
              boundary between retrieved context and a grounded claim.
            </p>
            <Link className="text-link" href="/projects/ai-portfolio">
              Read the case study ↗
            </Link>
          </div>
          <div>
            <p className="eyebrow">A note on AI output</p>
            <p>
              Responses are generated and may be mistaken. The written project
              notes remain available when an AI provider is unavailable.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
