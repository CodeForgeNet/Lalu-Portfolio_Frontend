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
      <div className="lab-layout">
        <section id="assistant" aria-label="Portfolio assistant">
          <Assistant />
        </section>
        <aside className="lab-aside">
          <div>
            <p className="eyebrow">01 / Evidence workbench</p>
            <h2>Document investigation</h2>
            <p>
              Select source documents, inspect the retrieved passages, and
              compare what changes when you exclude evidence. Recorded replay is
              available without a new model call.
            </p>
            <Link className="text-link" href="/lab/documents">
              Open the workbench ↗
            </Link>
          </div>
          <div>
            <p className="eyebrow">02 / Read the implementation</p>
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
