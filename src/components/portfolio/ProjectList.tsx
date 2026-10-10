import Link from "next/link";
import { studies } from "@/data/portfolio";

export default function ProjectList() {
  return (
    <div className="project-list">
      {studies.map((project, index) => (
        <article key={project.slug} className="project-row">
          <div className="project-number">0{index + 1}</div>
          <div className="project-copy">
            <p className="eyebrow">{project.category}</p>
            <h3>
              <Link href={`/projects/${project.slug}`}>
                {project.title}
                <span aria-hidden="true"> ↗</span>
              </Link>
            </h3>
            <p>{project.summary}</p>
            <div className="tags">
              {project.technologies.slice(0, 4).map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>
          <div className="project-evidence">
            <span className="eyebrow">Engineering focus</span>
            <p>{project.outcome}</p>
            <Link className="text-link" href={`/projects/${project.slug}`}>
              Read case study <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
