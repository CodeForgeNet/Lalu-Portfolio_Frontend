import Link from "next/link";
import {
  capabilities,
  experience,
  openSource,
  profile,
} from "@/data/portfolio";
import ProjectList from "@/components/portfolio/ProjectList";
import SystemDrawing from "@/components/portfolio/SystemDrawing";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="shell">
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-role">{profile.role}</p>
            <h1>
              From model
              <br />
              to <em>working system.</em>
            </h1>
            <p className="hero-description">
              I’m Lalu. I build evidence-aware AI products and the engineering
              around them—decision guardrails, agent workflows, evaluation,
              reliable APIs, and interfaces that expose how the system behaves.
            </p>
            <div className="hero-actions">
              <Link href="#work" className="button-primary">
                Explore the work <span aria-hidden="true">↘</span>
              </Link>
              <a className="text-link" href={profile.github}>
                GitHub ↗
              </a>
            </div>
            <p className="hero-location">
              {profile.location} <span>·</span> Python / TypeScript / AI systems
            </p>
          </div>
          <SystemDrawing />
        </section>
        <div className="index-strip">
          <span>Applied AI Systems Lab</span>
          <span>Ideas → implementation → inspection</span>
          <a href="#work" aria-label="Scroll to selected work">
            Scroll to explore ↓
          </a>
        </div>
        <section className="section open-source-section" id="open-source">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / Upstream contributions</p>
              <h2>
                Fixes that reached <em>other systems.</em>
              </h2>
            </div>
            <p>
              Contributions to established agent projects,
              <br />
              linked to their review history.
            </p>
          </div>
          <div className="capability-grid open-source-grid">
            {openSource.map((entry) => (
              <article key={`${entry.project}-${entry.reference}`}>
                <span className="capability-tools">
                  {entry.project} · {entry.reference}
                </span>
                <h3>{entry.impact}</h3>
                <p>{entry.description}</p>
                <a className="text-link" href={entry.href}>
                  Inspect contribution ↗
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="section" id="work">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / Selected engineering work</p>
              <h2>
                Built to be <em>looked into.</em>
              </h2>
            </div>
            <p>
              Explore the problem, the implementation,
              <br />
              and the decisions in between.
            </p>
          </div>
          <ProjectList />
          <Link href="/projects" className="text-link section-more">
            All project notes ↗
          </Link>
        </section>
        <section className="lab-feature landing-evidence-feature">
          <div>
            <p className="eyebrow">03 / Document ingestion + evidence</p>
            <h2>
              Change the evidence.
              <br />
              <em>See what survives.</em>
            </h2>
            <p>
              Start with a prepared document collection, inspect the passages
              selected for a question, then remove a source and compare the
              answer. Every run keeps its evidence trail.
            </p>
            <Link href="/lab/documents" className="button-primary">
              Open the evidence workbench <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="evidence-graphic" aria-hidden="true">
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
        <section className="section" id="capabilities">
          <div className="section-heading">
            <div>
              <p className="eyebrow">04 / Capabilities</p>
              <h2>
                The whole path
                <br />
                <em>from input to interface.</em>
              </h2>
            </div>
          </div>
          <div className="capability-grid">
            {capabilities.map((item, index) => (
              <article key={item.title}>
                <span className="capability-symbol" aria-hidden="true">
                  {["[↗]", "{…}", "</>"][index]}
                </span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <span className="capability-tools">{item.tools}</span>
                <Link href={item.href} className="text-link">
                  See it in the work ↗
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="section experience-section">
          <div>
            <p className="eyebrow">05 / In practice</p>
            <h2>
              Engineering
              <br />
              <em>in context.</em>
            </h2>
            <Link href="/about" className="text-link">
              More about me ↗
            </Link>
          </div>
          <div className="experience-list">
            {experience.map((entry) => (
              <article key={entry.organization}>
                <div className="experience-meta">
                  <span>{entry.duration}</span>
                  <span>
                    {entry.type === "apprenticeship"
                      ? "Apprenticeship"
                      : "Professional work"}
                  </span>
                </div>
                <h3>{entry.organization}</h3>
                <span className="experience-title">{entry.title}</span>
                <p>{entry.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section principles">
          <div className="section-heading">
            <div>
              <p className="eyebrow">06 / Engineering principles</p>
              <h2>
                Make the behavior <em>visible.</em>
              </h2>
            </div>
          </div>
          <div className="principle-grid">
            <article>
              <span>01</span>
              <h3>Show the source.</h3>
              <p>
                The workbench connects retrieved passages to the original
                document. A reference is a starting point for inspection.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Keep the failure.</h3>
              <p>
                Interrupted investigations retain partial output and a terminal
                state. A missing answer is part of the system’s behavior.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Make it replayable.</h3>
              <p>
                Ordered event logs let visitors revisit a run without paying for
                another model request.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
