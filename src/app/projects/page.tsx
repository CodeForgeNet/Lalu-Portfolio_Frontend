import type { Metadata } from "next";
import ProjectList from "@/components/portfolio/ProjectList";
export const metadata: Metadata = {
  title: "Engineering work",
  description:
    "Case studies in evidence-gated legal drafting, bio-inspired computer vision, agent systems, retrieval, and evaluation. Explore the implementation and its trade-offs.",
  alternates: { canonical: "/projects" },
};
export default function ProjectsPage() {
  return (
    <main className="shell page-body" id="main-content" tabIndex={-1}>
      <header className="page-intro">
        <p className="eyebrow">Selected work / Project notes</p>
        <h1>
          The systems.
          <br />
          <em>The decisions behind them.</em>
        </h1>
        <p>
          Professional systems, personal projects, and open-source work,
          explained through their implementation, constraints, and lessons.
        </p>
      </header>
      <ProjectList />
    </main>
  );
}
