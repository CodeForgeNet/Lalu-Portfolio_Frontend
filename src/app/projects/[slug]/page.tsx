import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { studies } from "@/data/portfolio";
import Architecture from "@/components/portfolio/Architecture";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return studies.map((study) => ({ slug: study.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = studies.find((item) => item.slug === slug);
  if (!study)
    return {
      title: "Project not found",
      robots: { index: false },
      alternates: { canonical: null },
    };
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: `${study.title} | Lalu Kumar`,
      description: study.summary,
      url: `/projects/${slug}`,
      images: ["/opengraph-image"],
    },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const study = studies.find((item) => item.slug === slug);
  if (!study) notFound();
  return (
    <main className="shell page-body" id="main-content" tabIndex={-1}>
      <header className="page-intro">
        <Link href="/projects" className="text-link">
          ← All work
        </Link>
        <p className="eyebrow">
          {study.category} / {study.year}
        </p>
        <h1>
          {study.title}
          <br />
          <em>{study.headline}</em>
        </h1>
        <p>{study.summary}</p>
        <div className="hero-actions">
          {study.links.map((link) => {
            const isExternal = link.href.startsWith("http");
            return (
              <Link
                className="button-primary"
                key={link.href}
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {link.label} ↗
              </Link>
            );
          })}
        </div>
      </header>
      <div className="case-meta">
        <div>
          <span className="eyebrow">My contribution</span>
          <p>{study.contribution}</p>
        </div>
        <div>
          <span className="eyebrow">Built with</span>
          <p>{study.technologies.join(" · ")}</p>
        </div>
        <div>
          <span className="eyebrow">Engineering outcome</span>
          <p>{study.outcome}</p>
        </div>
      </div>
      {study.architecture && <Architecture architecture={study.architecture} />}
      <div className="case-body">
        <nav className="case-toc" aria-label="In this case study">
          {study.sections.map((section, index) => (
            <a key={section.title} href={`#section-${index}`}>
              {section.title}
            </a>
          ))}
          {study.decisions && <a href="#decisions">Decision records</a>}
        </nav>
        <div>
          {study.sections.map((section, index) => (
            <section
              className="case-section"
              id={`section-${index}`}
              key={section.title}
            >
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          {study.decisions && (
            <section className="case-section" id="decisions">
              <h2>Engineering decision records</h2>
              {study.decisions.map((decision, index) => (
                <details className="decision" key={decision.title}>
                  <summary>
                    0{index + 1} / {decision.title}
                  </summary>
                  <p>
                    <strong>Context.</strong> {decision.context}
                  </p>
                  <p>
                    <strong>Decision.</strong> {decision.decision}
                  </p>
                  <p>
                    <strong>Trade-off.</strong> {decision.consequence}
                  </p>
                </details>
              ))}
            </section>
          )}
          <aside className="evidence-note">
            <span className="eyebrow">Evidence & scope</span>
            <p>{study.evidence}</p>
          </aside>
          <Link href="/projects" className="text-link section-more">
            ← Explore the other projects
          </Link>
        </div>
      </div>
    </main>
  );
}
