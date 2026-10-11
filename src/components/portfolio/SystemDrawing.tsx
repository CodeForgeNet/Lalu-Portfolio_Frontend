const mono = "var(--font-jetbrains-mono), monospace";

export default function SystemDrawing() {
  return (
    <figure className="system-drawing">
      <div className="drawing-heading">
        <span className="eyebrow">System map / 001</span>
        <span className="diagram-tag">EVIDENCE + AGENTS</span>
      </div>
      <svg
        viewBox="0 0 620 430"
        role="img"
        aria-labelledby="system-title system-desc"
      >
        <title id="system-title">Evidence-aware AI systems map</title>
        <desc id="system-desc">
          A drafting goal and its sources enter an agent router and evidence
          inventory. A deterministic gate chooses ready, partial, or blocked
          behavior. Supported paths reach drafting and validation; blocked
          paths explain missing material. Open-source integrations and
          evaluation feed back into the system.
        </desc>
        <defs>
          <pattern
            id="system-dots"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".12" />
          </pattern>
          <marker
            id="system-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0 L7,3.5 L0,7" fill="none" stroke="currentColor" />
          </marker>
        </defs>

        <rect width="620" height="430" fill="url(#system-dots)" />

        <g
          className="diagram-label"
          style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: "1px" }}
        >
          <text x="22" y="22">01 / INTERPRET</text>
          <text x="22" y="215">02 / RESOLVE</text>
          <text x="22" y="422">03 / OBSERVE + IMPROVE</text>
        </g>

        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          markerEnd="url(#system-arrow)"
        >
          <path d="M190 70 H230" />
          <path d="M390 70 H430" />
          <path d="M510 96 V132 H310 V140" />
          <path d="M310 192 V214" />
          <path d="M120 214 V226" />
          <path d="M310 214 V226" />
          <path d="M500 214 V226" />
          <path d="M120 282 V305 H250" />
          <path d="M310 282 V306" />
          <path d="M500 282 V306" />
        </g>

        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5 5"
          opacity=".78"
          markerEnd="url(#system-arrow)"
        >
          <path d="M174 388 H205 V96 H275" />
          <path d="M446 388 H415 V113 H510" />
        </g>

        <g className="diagram-box">
          <rect x="30" y="44" width="160" height="52" rx="2" />
          <rect x="230" y="44" width="160" height="52" rx="2" />
          <rect x="430" y="44" width="160" height="52" rx="2" />
          <rect x="40" y="226" width="160" height="56" rx="2" />
          <rect x="230" y="226" width="160" height="56" rx="2" />
          <rect x="420" y="226" width="160" height="56" rx="2" />
          <rect x="250" y="306" width="160" height="52" rx="2" />
          <rect x="420" y="306" width="160" height="52" rx="2" />
          <rect x="30" y="374" width="144" height="28" rx="2" />
          <rect x="446" y="374" width="144" height="28" rx="2" />
        </g>

        <g className="diagram-box diagram-box--accent">
          <rect x="110" y="140" width="400" height="52" rx="2" />
          <rect x="250" y="306" width="160" height="52" rx="2" />
        </g>

        <g
          textAnchor="middle"
          className="diagram-text"
          style={{ fontFamily: mono, fontSize: 13 }}
        >
          <text x="110" y="74">GOAL + SOURCES</text>
          <text x="310" y="74">AGENT ROUTER</text>
          <text x="510" y="74">EVIDENCE MAP</text>
          <text x="310" y="163">FEASIBILITY GATE</text>
          <text x="120" y="251">READY</text>
          <text x="310" y="251">PARTIAL</text>
          <text x="500" y="251">BLOCKED</text>
          <text x="330" y="337">DRAFT + VALIDATE</text>
          <text x="500" y="337">EXPLAIN + NEXT STEP</text>
        </g>

        <g
          textAnchor="middle"
          className="diagram-node-note"
          style={{ fontFamily: mono, fontSize: 9, letterSpacing: ".5px" }}
        >
          <text x="310" y="179">DETERMINISTIC · SUPPORTED ACTIONS ONLY</text>
          <text x="120" y="268">PROCEED</text>
          <text x="310" y="268">LIMIT SCOPE</text>
          <text x="500" y="268">REQUEST MATERIAL</text>
          <text x="102" y="392">OSS / MCP INPUTS</text>
          <text x="518" y="392">EVAL / REPLAY</text>
        </g>

        <circle cx="310" cy="204" r="3" className="signal-dot" />
      </svg>
      <figcaption>
        <span className="drawing-index">01 /</span> Unsupported output stops.
        <br />
        <span>Interpretation is flexible. Decisions stay explicit.</span>
      </figcaption>
    </figure>
  );
}
