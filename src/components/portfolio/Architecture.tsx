import type { CaseStudy } from "@/data/portfolio";

export default function Architecture({
  architecture,
}: {
  architecture: NonNullable<CaseStudy["architecture"]>;
}) {
  return (
    <figure className="architecture">
      <figcaption className="eyebrow">{architecture.caption}</figcaption>
      <ol className="architecture-flow">
        {architecture.nodes.map((node, index) => (
          <li key={node.name}>
            <details>
              <summary>
                <span className="node-number">0{index + 1}</span>
                <span>{node.name}</span>
                <span className="disclosure-mark" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{node.detail}</p>
            </details>
          </li>
        ))}
      </ol>
      {architecture.branch && (
        <p className="architecture-branch">↳ {architecture.branch}</p>
      )}
    </figure>
  );
}
