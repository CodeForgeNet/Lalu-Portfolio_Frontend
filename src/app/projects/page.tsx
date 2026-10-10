import type { Metadata } from "next";
import ProjectList from "@/components/portfolio/ProjectList";
export const metadata: Metadata = {
  title: "Engineering work",
  description:
    "Case studies in retrieval, document intelligence, and prompt testing. Explore the implementation and its trade-offs.",
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
          Personal projects and open-source work, explained through their
          implementation, constraints, and lessons.
        </p>
      </header>
      <ProjectList />
      <aside className="project-note">
        <p className="eyebrow">Also exploring / Computer vision</p>
        <h2>NeuroSight</h2>
        <p>
          A biologically inspired motion detection library using Python, NumPy,
          and OpenCV. An exploration of motion signals through correlation
          rather than a trained deep-learning model.
        </p>
        <p>
          This project note is based on the supplied project description;
          benchmark and deployment claims are intentionally omitted.
        </p>
      </aside>
    </main>
  );
}
