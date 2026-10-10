export default function SystemDrawing() {
  return (
    <figure className="system-drawing">
      <div className="drawing-heading">
        <span className="eyebrow">System note / 001</span>
        <span className="diagram-tag">RAG</span>
      </div>
      <svg
        viewBox="0 0 440 360"
        role="img"
        aria-labelledby="system-title system-desc"
      >
        <title id="system-title">The portfolio assistant’s request path</title>
        <desc id="system-desc">
          A question is embedded and checked against a semantic cache. A cache
          hit returns a stored answer. A miss retrieves context before
          generation.
        </desc>
        <defs>
          <pattern
            id="dots"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".12" />
          </pattern>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="currentColor" />
          </marker>
        </defs>
        <rect width="440" height="360" fill="url(#dots)" />
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          markerEnd="url(#arrow)"
        >
          <path d="M220 67 V92" />
          <path d="M220 135 V160" />
          <path d="M220 203 V245" />
          <path d="M295 182 H365 V308 H297" strokeDasharray="4 4" />
          <path d="M220 273 V286" />
        </g>
        <g className="diagram-box">
          <rect x="145" y="25" width="150" height="42" rx="2" />
          <rect x="145" y="93" width="150" height="42" rx="2" />
          <rect x="145" y="161" width="150" height="42" rx="2" />
          <rect x="145" y="245" width="150" height="28" rx="2" />
          <rect x="145" y="287" width="150" height="42" rx="2" />
        </g>
        <g textAnchor="middle" className="diagram-text">
          <text x="220" y="51">
            A visitor’s question
          </text>
          <text x="220" y="119">
            Query embedding
          </text>
          <text x="220" y="187">
            Semantic cache
          </text>
          <text x="220" y="264">
            Retrieve → generate
          </text>
          <text x="220" y="313">
            Answer + sources
          </text>
        </g>
        <g className="diagram-label">
          <text x="237" y="229">
            MISS
          </text>
          <text x="335" y="170">
            HIT
          </text>
          <text x="27" y="46">
            INPUT
          </text>
          <text x="27" y="310">
            OUTPUT
          </text>
        </g>
        <circle cx="220" cy="225" r="3" className="signal-dot" />
      </svg>
      <figcaption>
        <span className="drawing-index">01 /</span> The model is one part.
        <br />
        <span>The system around it matters.</span>
      </figcaption>
    </figure>
  );
}
