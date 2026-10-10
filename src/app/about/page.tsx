import type { Metadata } from "next";
import Link from "next/link";
import { experience, capabilities, profile } from "@/data/portfolio";
import resume from "@/data/resume.json";
export const metadata: Metadata = {
  title: "About",
  description:
    "Lalu Kumar — AI Systems & Full Stack Engineer. Professional experience, engineering capabilities, and background.",
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <main className="shell page-body" id="main-content" tabIndex={-1}>
      <header className="page-intro">
        <p className="eyebrow">About / {profile.location}</p>
        <h1>
          Curious about the model.
          <br />
          <em>Responsible for the system.</em>
        </h1>
        <p>
          I’m Lalu Kumar, an AI Systems & Full Stack Engineer. My work spans
          retrieval-backed applications, document intelligence, and the product
          interfaces that make them useful.
        </p>
        <div className="hero-actions">
          <a href={`mailto:${profile.email}`} className="button-primary">
            Get in touch ↗
          </a>
          <a href="/docs/Lalu_FullStack-AI-Resume.pdf" className="text-link">
            Read résumé ↗
          </a>
        </div>
      </header>
      <section className="experience-section">
        <div>
          <p className="eyebrow">Professional experience</p>
          <h2>
            Building with
            <br />
            <em>real constraints.</em>
          </h2>
          <p className="assistant-description">
            A high-level account of my work. Employer-specific implementation
            details and private material are excluded.
          </p>
        </div>
        <div className="experience-list">
          {experience.map((entry) => (
            <article key={entry.organization}>
              <div className="experience-meta">
                <span>{entry.duration}</span>
                <span>{entry.type}</span>
              </div>
              <h3>{entry.organization}</h3>
              <span className="experience-title">{entry.title}</span>
              <p>{entry.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Engineering capabilities</p>
            <h2>Connecting the pieces.</h2>
          </div>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <span className="capability-tools">{item.tools}</span>
              <Link className="text-link" href={item.href}>
                Explore the implementation ↗
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Background</p>
            <h2>Always learning.</h2>
          </div>
        </div>
        <div className="capability-grid">
          {resume.education.map((entry) => (
            <article key={entry.degree}>
              <h3>{entry.degree}</h3>
              <p>{entry.institution}</p>
              <span className="capability-tools">{entry.duration}</span>
            </article>
          ))}
          <article>
            <h3>Beyond the editor</h3>
            <p>
              I enjoy philosophical fiction, anime, and exploring the
              technologies behind everyday tools.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
