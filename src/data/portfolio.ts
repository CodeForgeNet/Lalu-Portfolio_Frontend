import resume from "./resume.json";

export const profile = {
  name: resume.name,
  role: "AI Systems & Full Stack Engineer",
  location: resume.location,
  email: resume.email,
  github: resume.github,
  linkedin: resume.linkedin,
  url: resume.portfolio.replace(/\/$/, ""),
  description:
    "Lalu Kumar builds AI applications, retrieval workflows, and full-stack products. Explore the systems, decisions, and implementation behind the work.",
};

export type ArchitectureNode = { name: string; detail: string };
export type CaseStudy = {
  slug: string;
  title: string;
  category: string;
  year: string;
  headline: string;
  summary: string;
  contribution: string;
  technologies: string[];
  outcome: string;
  sections: { title: string; body: string }[];
  architecture?: {
    caption: string;
    nodes: ArchitectureNode[];
    branch?: string;
  };
  decisions?: {
    title: string;
    context: string;
    decision: string;
    consequence: string;
  }[];
  links: { label: string; href: string }[];
  evidence: string;
};

export const studies: CaseStudy[] = [
  {
    slug: "evidence-gated-legal-drafting",
    title: "Evidence-Gated Legal Drafting",
    category: "Professional work · Legal AI systems",
    year: "2026",
    headline: "Know when the evidence is not enough.",
    summary:
      "A legal drafting workflow that analyzes source material, detects evidence gaps and contradictions, and uses deterministic rules to decide whether drafting may proceed.",
    contribution:
      "Designed and implemented the typed drafting context, document-specific analysis flow, guardrails, feasibility resolver, and evidence-aware next-step logic within a larger company product.",
    technologies: ["TypeScript", "Node.js", "LLM workflows", "Jest"],
    outcome:
      "Separated AI interpretation from product decisions, preventing unsupported document generation while preserving useful source analysis.",
    architecture: {
      caption:
        "Evidence-gated drafting · sanitized system design. Open a stage to inspect its responsibility.",
      nodes: [
        {
          name: "Drafting goal",
          detail:
            "A typed session context carries the selected document type, case context, and uploaded file references through the workflow. The requested document determines which evidence elements are required.",
        },
        {
          name: "Source analysis",
          detail:
            "Documents are classified and summarized independently. The workflow builds an evidence inventory, attributes claims to their sources, and retains useful summaries even when the requested draft is unsupported.",
        },
        {
          name: "Evidence guardrails",
          detail:
            "Document-specific checks distinguish supported, missing, not-applicable, and unknown elements. Explicit mismatch rules handle cases where a general scoring threshold would be too weak.",
        },
        {
          name: "Feasibility resolver",
          detail:
            "Application rules—not free-form model output—select READY, PARTIAL_MISMATCH, INCOMPATIBLE, or AMBIGUOUS and return only the actions permitted for that evidence state.",
        },
        {
          name: "Controlled draft",
          detail:
            "Drafting starts only when the resolver permits it. Final validation checks source support, document structure, unresolved contradictions, and unsupported content before delivery.",
        },
      ],
      branch:
        "Ready → draft / partial → limited draft or request material / incompatible → explain mismatch / ambiguous → clarify.",
    },
    sections: [
      {
        title: "Problem & context",
        body: "Legal files can contain extensive case information without containing the evidence required for a requested document. Seven litigation filings may support a case summary while providing no expert qualifications, methodology, or opinions for an Expert Report. Treating document volume as evidence sufficiency produces confident but unsupported drafts.",
      },
      {
        title: "System design",
        body: "The workflow first identifies the drafting goal, then classifies and summarizes sources, builds an evidence inventory, and evaluates document-specific requirements. Specialized analysis components interpret the material; a deterministic feasibility resolver controls whether the product may proceed, request missing material, offer a limited draft, change the goal, or ask for clarification.",
      },
      {
        title: "Decision model",
        body: "READY permits a supported draft. PARTIAL_MISMATCH permits a limited draft only when meaningful relevant evidence exists. INCOMPATIBLE removes that option. AMBIGUOUS requests targeted clarification instead of treating uncertainty as incompatibility. Structured resolver output remains authoritative; the suggestion layer may explain actions but cannot invent new ones.",
      },
      {
        title: "Failure behavior",
        body: "A blocked draft still returns source summaries, available evidence, missing requirements, contradictions, and valid next steps. Allegations remain attributed rather than becoming established facts. Missing expert material cannot be replaced by background facts from pleadings, and changing the drafting goal reuses the source inventory while rerunning goal-specific analysis.",
      },
      {
        title: "Validation & testing",
        body: "Typed contracts keep analysis, feasibility, and presentation separate. Tests cover routing and resolver behavior, while TypeScript compilation checks service boundaries. Final validation is designed to stop unsupported claims, silent gap-filling, incorrect document structure, and evidence-free contradiction resolution.",
      },
      {
        title: "Scope",
        body: "This case study presents a sanitized architecture from professional work. It excludes employer-specific prompts, customer data, deployment details, and unconfirmed infrastructure. It describes evidence-control and workflow design—not legal advice or a claim that language models can independently determine legal sufficiency.",
      },
    ],
    decisions: [
      {
        title: "Keep feasibility deterministic",
        context:
          "A model can interpret evidence but may also rationalize missing material or propose an unsafe action.",
        decision:
          "Represent evidence state and allowed actions as typed values resolved by explicit application rules.",
        consequence:
          "Product behavior becomes testable and consistent, while document requirements must be maintained deliberately as supported drafting goals expand.",
      },
      {
        title: "Preserve analysis when drafting is blocked",
        context:
          "An incompatibility response previously risked hiding useful summaries of uploaded material.",
        decision:
          "Return source analysis and feasibility together instead of discarding analysis after a blocked decision.",
        consequence:
          "Users retain useful work and understand the gap, at the cost of a richer response contract and more UI states.",
      },
      {
        title: "Separate missing from unknown",
        context:
          "Absent evidence, irrelevant evidence, and failed classification require different next steps.",
        decision:
          "Track supported, partial, missing, not-applicable, and unknown evidence states explicitly.",
        consequence:
          "The system can ask focused questions instead of collapsing every uncertainty into a generic upload error.",
      },
    ],
    links: [],
    evidence:
      "Source: owner-provided September 2026 architecture summary and reported implementation history. Employer-specific source code and private case material were not included or independently reviewed; infrastructure not established by that record is intentionally omitted.",
  },
  {
    slug: "neurosight",
    title: "NeuroSight",
    category: "Featured open source · Bio-inspired computer vision",
    year: "2026",
    headline: "Motion detection, inspired by a fly.",
    summary:
      "A lightweight Python motion-detection library that translates the Drosophila optic-lobe circuit into an explainable, CPU-friendly vision pipeline.",
    contribution:
      "Designed and published the library: connectome-weight integration, Hassenstein–Reichardt correlation, frame and video processing, directional outputs, tests, documentation, and PyPI packaging.",
    technologies: ["Python", "NumPy", "OpenCV", "PyPI"],
    outcome:
      "A self-contained motion detector that produces saliency maps and local directional vectors without a trained neural network or GPU runtime.",
    architecture: {
      caption:
        "NeuroSight · motion-signal path. Open a component to inspect its role.",
      nodes: [
        {
          name: "Frame pair",
          detail:
            "The detector accepts consecutive video frames through a frame-by-frame API or streams them from a video source. OpenCV handles video I/O and image preparation.",
        },
        {
          name: "ON / OFF signals",
          detail:
            "Brightness changes are separated into pathways analogous to the fly visual system: T4 neurons respond to moving bright edges and T5 neurons to moving dark edges.",
        },
        {
          name: "Temporal delay",
          detail:
            "Medulla-inspired channels provide delayed and current signals. This time offset lets a neighboring-pixel correlation distinguish motion from a static contrast edge.",
        },
        {
          name: "Direction correlation",
          detail:
            "A Hassenstein–Reichardt-style correlator combines delayed and undelayed neighboring signals. Pre-extracted, normalized connectome weights shape the four cardinal direction responses.",
        },
        {
          name: "Motion outputs",
          detail:
            "The public API returns a normalized saliency map plus tile-level vectors containing dominant direction, confidence, and spatial coordinates. Video output can overlay the vectors.",
        },
      ],
      branch:
        "Bright-edge motion → ON pathway / dark-edge motion → OFF pathway → four directional responses → saliency and vectors.",
    },
    sections: [
      {
        title: "Problem & context",
        body: "Robotics and edge-vision systems often need a fast indication of where motion is happening and which way it is moving. Large learned optical-flow models can add memory, accelerator, and deployment costs. NeuroSight explores a different trade-off: translate a compact biological motion circuit into deterministic array operations that remain inspectable.",
      },
      {
        title: "Biological model",
        body: "The implementation is based on the fly optic lobe. T4 and T5 pathways cover moving bright and dark edges, with four subtypes representing the cardinal directions. The project documents synapse counts extracted from the Drosophila hemibrain connectome through neuprint and normalized into correlator weights. This is a software abstraction inspired by that circuit, not a complete simulation of fly vision.",
      },
      {
        title: "Implementation",
        body: "NumPy performs the signal and correlation operations while OpenCV handles frames, cameras, and video files. The Hassenstein–Reichardt mechanism multiplies a delayed response at one location with a current response at a neighbor; comparing opposing correlations produces direction-selective responses. Results are aggregated into spatial tiles and exposed as a saliency array and directional-vector dictionary.",
      },
      {
        title: "Evaluation & testing",
        body: "The supplied résumé reports complete cardinal-direction accuracy on synthetic tests and 36 unit tests. The public repository contains a test suite and documents typed, tested packaging, but those exact results were not independently rerun during this portfolio change. Synthetic direction tests verify controlled motion patterns; they do not establish accuracy on every camera, scene, or robotics task.",
      },
      {
        title: "Performance",
        body: "The repository reports 45–50 FPS, 20–25 ms latency, and 15 MB memory for 1280×720 video on an Intel i7-12700K, alongside comparisons with OpenCV OpticalFlow and TensorFlow RAFT. These are maintainer-published measurements under that stated setup, not measurements reproduced by this portfolio. The package is published on PyPI and requires Python 3.10 or newer.",
      },
      {
        title: "Failure modes & limits",
        body: "A compact correlation model trades dense optical-flow precision for simplicity. Tile size controls spatial detail; coarse tiles can hide small motion, while smaller tiles increase work and noise sensitivity. Camera motion, flicker, low contrast, occlusion, and parameters that do not match the frame rate can weaken the directional signal. The library is complementary to optical flow rather than a universal replacement.",
      },
      {
        title: "Where it can go next",
        body: "The saliency and vector outputs provide a base for collision avoidance, looming cues, and time-to-contact experiments. Stronger next steps include repeatable benchmarks across ARM hardware, real-world annotated motion sequences, sensitivity analysis for tile size and temporal constants, and comparisons that publish scripts and raw results alongside summary tables.",
      },
    ],
    decisions: [
      {
        title: "Use a biological correlator instead of a trained model",
        context:
          "The goal was a small, explainable motion primitive that could run without a GPU or model download.",
        decision:
          "Implement a Hassenstein–Reichardt-style correlation pipeline with connectome-derived directional weights.",
        consequence:
          "The signal path stays inspectable and portable, while giving up the dense accuracy and scene-level learning available to larger optical-flow models.",
      },
      {
        title: "Expose saliency and structured vectors",
        context:
          "A heatmap is useful for visualization, but downstream robotics code also needs direction and location.",
        decision:
          "Return both a normalized saliency map and tile-level direction, confidence, and coordinates.",
        consequence:
          "The same detector supports visual overlays and programmatic reactions, with tile resolution becoming an explicit accuracy/performance trade-off.",
      },
      {
        title: "Bundle extracted weights",
        context:
          "Requiring a connectome service at runtime would make a small motion library fragile and hard to deploy at the edge.",
        decision:
          "Ship the pre-extracted biological weights with the package and keep runtime processing local.",
        consequence:
          "Installation and inference stay self-contained, while weight provenance and future connectome updates must be maintained in the repository.",
      },
    ],
    links: [
      {
        label: "View repository",
        href: "https://github.com/CodeForgeNet/neurosight",
      },
      { label: "View on PyPI", href: "https://pypi.org/project/neurosight/" },
    ],
    evidence:
      "Source: the public CodeForgeNet/neurosight repository, its README, the PyPI 0.1.1 package page, and owner-provided résumé data. Repository benchmark results are labelled as reported and were not rerun for this portfolio update.",
  },
  {
    slug: "fitcheck",
    title: "FitCheck",
    category: "Personal project · Browser-local AI",
    year: "2026",
    headline: "A private, evidence-backed way to read a role.",
    summary:
      "A browser-local job-description analyzer that compares role requirements with public resume evidence, then surfaces approximate fit, gaps, and questions to verify.",
    contribution:
      "Designed and implemented the FitCheck product, Needle browser integration, Web Worker lifecycle, structured extraction, local embeddings, weighted scoring, privacy controls, recruiter UI, and optional explanation flow.",
    technologies: ["TypeScript", "Next.js", "Web Workers", "WebAssembly", "Needle", "Embeddings"],
    outcome:
      "Recruiters can inspect evidence-backed matches and gaps without sending the original JD to the portfolio backend or storing analysis in a database.",
    architecture: {
      caption:
        "FitCheck · browser-local role analysis path. Open a component to inspect its responsibility.",
      nodes: [
        {
          name: "Job description input",
          detail:
            "A recruiter pastes a job description into the analyzer. Input is limited to 200–20,000 characters and remains in page memory for the active session.",
        },
        {
          name: "Needle 3.2 WASM runtime",
          detail:
            "Needle is a compact on-device tool-calling runtime. Its pinned browser JavaScript, WASM engine, and model archive load lazily inside a Web Worker so the main UI remains responsive.",
        },
        {
          name: "Structured requirements",
          detail:
            "Needle extracts role title, seniority, experience, required skills, preferred skills, responsibilities, and education or certification requirements. Incomplete model fields are supplemented by deterministic local extraction.",
        },
        {
          name: "Resume evidence and embeddings",
          detail:
            "FitCheck builds evidence only from public professional fields: skills, experience, projects, education, and certifications. Needle creates in-memory embeddings for extracted requirements and resume evidence.",
        },
        {
          name: "Weighted fit scoring",
          detail:
            "Exact normalized aliases receive full matches. Otherwise cosine similarity classifies evidence as match, partial, or gap. Available categories are weighted and missing categories are redistributed without inventing evidence.",
        },
        {
          name: "Optional AI explanation",
          detail:
            "After an explicit click, a compact set of derived role and match facts can be sent to the explanation endpoint. The original JD stays local and is never included in that request.",
        },
      ],
    },
    sections: [
      {
        title: "Problem & context",
        body: "Recruiters often need a quick first read of whether a candidate’s public work relates to a role, but a generic keyword search misses evidence spread across projects, experience, and technical skills. FitCheck turns that first read into an inspectable portfolio signal while keeping the pasted job description inside the recruiter’s browser.",
      },
      {
        title: "What Needle contributes",
        body: "Needle is a compact local runtime for structured tool calling and embeddings. FitCheck uses the pinned Needle 3.2 browser assets to extract job requirements and create vector representations without Pinecone or a remote embedding call. The runtime and model archive are loaded only when the analyzer opens and run inside a Web Worker.",
      },
      {
        title: "Browser-local pipeline",
        body: "The page sends the pasted JD and resume evidence to a dedicated worker. The worker initializes Needle, extracts a normalized job profile, creates embeddings for requirements and evidence, and returns only structured results to the UI. The main thread performs deterministic comparison and renders matched requirements, partial matches, gaps, and recruiter prompts.",
      },
      {
        title: "Evidence and scoring model",
        body: "The weighted score uses required skills at 45%, preferred skills at 10%, responsibilities at 25%, experience and seniority at 15%, and education or certifications at 5%. Exact normalized skill or alias matches receive full credit. Embedding similarity of at least 0.78 is a match, 0.62–0.779 is partial, and below 0.62 is a gap. Missing categories have their weight redistributed proportionally; fewer than two scorable categories returns a not-enough-detail state. The result is an approximate portfolio fit signal, not an ATS result or hiring recommendation.",
      },
      {
        title: "Privacy and optional explanation",
        body: "Core analysis uses no Pinecone, Redis, database, localStorage, sessionStorage, IndexedDB, cookies, or backend request. JD text, embeddings, and results stay in memory and are cleared on refresh, navigation, page exit, or the Clear action. The optional explanation runs only after an explicit recruiter click and receives compact derived facts rather than the original JD.",
      },
      {
        title: "Failure handling and fallback extraction",
        body: "Local model output can contain incomplete structured tool calls, so the worker accepts supported Needle response shapes, validates fields, and supplements missing role, experience, skill, responsibility, and education data with deterministic extraction from recognizable JD sections. Low-confidence results remain visible but are labelled directional. A model-load or analysis failure leaves a clear error state instead of producing a fabricated score.",
      },
      {
        title: "Validation and limitations",
        body: "Unit tests cover normalization, aliases, cosine thresholds, weighted scoring, weight redistribution, and insufficient-detail handling. TypeScript, lint, and production builds validate the frontend integration. The implementation does not claim production recruiter usage, benchmark accuracy, or universal document parsing; V1 accepts pasted text and treats location and personal attributes as outside the score.",
      },
    ],
    decisions: [
      {
        title: "Keep JD analysis local",
        context:
          "A recruiter may paste confidential role information that should not become portfolio memory or enter the existing retrieval system.",
        decision:
          "Run extraction, embeddings, comparison, and scoring in the browser without Pinecone, Redis, persistence, or a core backend request.",
        consequence:
          "Privacy and teardown behavior are clear, while model download size and browser capability become visible constraints.",
      },
      {
        title: "Run Needle inside a worker",
        context:
          "WASM model initialization and local embedding work can block the interface if performed on the main thread.",
        decision:
          "Load pinned Needle browser assets lazily in a dedicated Web Worker and reset its model state between unrelated analyses.",
        consequence:
          "The UI stays responsive and the model remains local, at the cost of worker lifecycle and unsupported-WASM handling.",
      },
      {
        title: "Recover from incomplete extraction",
        context:
          "A compact local model may return suppressed or partial structured calls for long, formatted job descriptions.",
        decision:
          "Validate Needle output and use deterministic section and keyword extraction to fill missing fields before scoring.",
        consequence:
          "Valid JDs produce useful directional results more consistently, while fallback confidence and limitations must remain visible.",
      },
      {
        title: "Make cloud explanation opt-in",
        context:
          "A polished explanation can help a recruiter, but automatic cloud transmission would conflict with the local-first promise.",
        decision:
          "Require an explicit Generate AI explanation action and send only normalized role, match, gap, and resume-evidence facts.",
        consequence:
          "The local score remains usable without a provider, while explanation availability depends on backend and OpenRouter configuration.",
      },
    ],
    links: [{ label: "Try FitCheck", href: "/lab/resume-match" }],
    evidence:
      "Source: the current FitCheck implementation in src/components/lab/ResumeMatch.tsx, src/lib/resume-match, and public/needle/worker.js; pinned runtime details in public/needle/README.md; the official Cactus Compute Needle repository; and tests/resume-match. No production recruiter usage or benchmark accuracy is claimed.",
  },
  {
    slug: "genesis-forge",
    title: "Genesis Forge",
    category: "Open source · Agent orchestration",
    year: "2025–2026",
    headline: "Bring specialist skills to the tools you already use.",
    summary:
      "A portable library of specialist agents, skills, and workflows, with local task routing and MCP integration for AI coding clients.",
    contribution:
      "Personal open-source project for reusable agent instructions, skill discovery, and CLI integration.",
    technologies: ["MCP", "Node.js", "Python", "Claude Code", "Gemini CLI"],
    outcome:
      "One skill library exposed through client rules, MCP tools, and a Node.js package interface.",
    architecture: {
      caption:
        "Genesis Forge · documented skill-discovery path. Open a component to inspect its role.",
      nodes: [
        {
          name: "Coding client",
          detail:
            "Claude Code, Gemini CLI, or Cline supplies the working environment. The host client handles model access and authentication.",
        },
        {
          name: "Rules / MCP",
          detail:
            "Gemini CLI integrates through a rules file. MCP-compatible clients discover tools such as skill_search, route_task, and get_skill_registry.",
        },
        {
          name: "Local routing",
          detail:
            "Deterministic routing selects relevant agents and skills locally. Genesis Forge does not require a separate model API key for this lookup.",
        },
        {
          name: "Skill library",
          detail:
            "The README describes 24 specialist agents, 79 skill modules, and 13 workflows. These are reusable instructions and expertise supplied to the host client.",
        },
        {
          name: "Client execution",
          detail:
            "The host client uses the selected instructions in its own workflow. Model behavior, tool permissions, and execution remain responsibilities of that environment.",
        },
      ],
    },
    sections: [
      {
        title: "Problem & context",
        body: "Coding assistants need different expertise for planning, implementation, debugging, and review. Copying those instructions between clients makes them harder to maintain. Genesis Forge packages specialist guidance into a shared library that existing AI coding environments can discover.",
      },
      {
        title: "Integration workflow",
        body: "The documented setup command connects rules and MCP configuration to supported clients; a remove command reverses those integrations. Gemini uses a master rules file, while Claude Code and Cline can discover skills through MCP. Node.js consumers can also import the package's skill-path helpers.",
      },
      {
        title: "Routing & maintenance",
        body: "Routing runs locally and selects from a skill registry. The repository documents rebuilding that registry with a Python script after adding skills. Keeping discovery separate from model execution lets the same content serve multiple clients, while making registry freshness and client compatibility explicit maintenance concerns.",
      },
      {
        title: "Scope & limitations",
        body: "This is an expertise provider within an existing AI environment. The documented agent and workflow counts describe its library, not independently running services or guaranteed task success. This case study does not claim measured token savings, download totals, or benchmarked orchestration quality.",
      },
    ],
    links: [
      {
        label: "View repository",
        href: "https://github.com/CodeForgeNet/genesis-forge",
      },
      {
        label: "View on npm",
        href: "https://www.npmjs.com/package/genesis-forge",
      },
    ],
    evidence:
      "Source: the public CodeForgeNet/genesis-forge README and owner-provided résumé. Architecture describes the documented integration model; package installation and client execution were not independently tested for this portfolio update.",
  },
  {
    slug: "opencontext",
    title: "OpenContext",
    category: "Open source · User-owned AI context",
    year: "2025–2026",
    headline: "Carry your context between AI tools.",
    summary:
      "A self-hostable context protocol, documented as PCSL, that lets AI tools request selected personal-context namespaces through a local API.",
    contribution:
      "Personal open-source project exploring portable AI context, scoped access, and browser integration.",
    technologies: ["Python", "FastAPI", "JWT", "MCP", "Browser extension"],
    outcome:
      "A documented CLI and API for maintaining context, issuing scoped tokens, inspecting access logs, and revoking clients.",
    architecture: {
      caption:
        "OpenContext / PCSL · documented context-access path. Open a component to inspect its role.",
      nodes: [
        {
          name: "Context store",
          detail:
            "The init command creates a local context.json file and signing secret. Namespaces separate identity, preferences, skills, projects, goals, and other context.",
        },
        {
          name: "FastAPI server",
          detail:
            "The local service exposes discovery, authorization, context retrieval, updates, audit logs, and client revocation through HTTP endpoints.",
        },
        {
          name: "Scoped token",
          detail:
            "A client requests named scopes and receives a short-lived JWT. The documented context endpoint returns the namespaces allowed by that token.",
        },
        {
          name: "Tool integration",
          detail:
            "HTTP clients and SDKs fetch context for use in an AI workflow. The repository also includes MCP and browser-extension integration paths.",
        },
        {
          name: "Audit & revoke",
          detail:
            "The CLI provides commands to inspect access logs and revoke client access. Revocation controls future access; it cannot recall context already copied into another tool.",
        },
      ],
    },
    sections: [
      {
        title: "Problem & context",
        body: "Moving between AI tools often means repeating the same background, preferences, and project details. OpenContext separates that information from any single chat product. Its public repository describes PCSL, the Personal Context Sovereignty Layer, as a protocol for keeping context under user control and sharing selected namespaces.",
      },
      {
        title: "Context workflow",
        body: "The documented CLI initializes a local context file, starts the API server, and supports viewing or updating context. A tool requests scoped access, then fetches context using its JWT. The Python SDK can insert the retrieved context into a prompt; raw HTTP offers an integration path for other clients.",
      },
      {
        title: "Access & deployment",
        body: "Namespaces make the sharing boundary explicit: an integration can request preferences and skills without requiring the entire context file. Local hosting is the default documented workflow, with optional Docker and cloud deployment. Once context is supplied to an external AI tool, that tool's handling of the data becomes part of the privacy boundary.",
      },
      {
        title: "Scope & limitations",
        body: "The README identifies a browser-extension limitation: injecting raw JSON into textareas may not work with every AI chat interface. This case study describes the documented protocol and interfaces; it does not establish a security audit, universal client compatibility, or tested cloud deployment. Scoped tokens still require a correctly configured authorization boundary.",
      },
    ],
    links: [
      {
        label: "View repository",
        href: "https://github.com/CodeForgeNet/opencontext",
      },
    ],
    evidence:
      "Source: the public CodeForgeNet/opencontext README, which documents the project as PCSL, and owner-provided résumé. CLI behavior, access controls, and integrations were not independently executed or audited for this portfolio update.",
  },
  {
    slug: "ai-portfolio",
    title: "Portfolio Assistant",
    category: "Personal project · Retrieval & streaming",
    year: "Ongoing",
    headline: "A conversation with the work behind it.",
    summary:
      "A retrieval-backed portfolio assistant with streamed answers, source context, and an inspectable execution trace.",
    contribution:
      "Full-stack implementation: the chat interface, server API boundary, retrieval pipeline, semantic caching, and streamed response states.",
    technologies: ["Next.js", "TypeScript", "Express", "Pinecone", "Redis"],
    outcome:
      "Retrieval, cache behavior, and generation made visible in one interface.",
    architecture: {
      caption:
        "Portfolio assistant · request path. Open a component to inspect its responsibility.",
      nodes: [
        {
          name: "Question",
          detail:
            "The browser submits a question to a same-origin Next.js API route. The server proxy attaches the service token; it is never sent to the browser.",
        },
        {
          name: "Embedding",
          detail:
            "The backend converts the question to a vector using the configured embedding provider. Embedding happens before cache lookup, including on a cache hit.",
        },
        {
          name: "Semantic cache",
          detail:
            "Redis stores question vectors and responses. Cosine similarity is compared with a configurable threshold, defaulting to 0.92. A match reuses the answer, sources, and suggestions.",
        },
        {
          name: "Retrieval",
          detail:
            "On a cache miss, Pinecone returns the closest indexed résumé passages. The prompt includes those passages plus a local résumé context fallback.",
        },
        {
          name: "Generation",
          detail:
            "The configured provider streams answer chunks. Server events report actual stage completion; the browser renders them alongside the answer.",
        },
      ],
      branch:
        "Cache hit → return the saved answer and sources. Cache miss → retrieve → generate → store the response.",
    },
    sections: [
      {
        title: "Problem & context",
        body: "A project list is useful for scanning, but visitors often have questions that cut across projects and experience. The assistant adds a conversational route into the portfolio while keeping the written case studies accessible without an AI service.",
      },
      {
        title: "Implementation",
        body: "Zustand holds conversation state. A same-origin server proxy forwards requests to the backend. The streaming endpoint emits named events for stage starts, completions, text chunks, and final sources. The client maintains one active request and distinguishes a completed response from an interrupted stream.",
      },
      {
        title: "Reliability & boundaries",
        body: "Provider credentials stay on the server. The proxy checks request origin and body size; backend middleware applies authentication and rate limits. Source matches are retrieval context, not proof that every generated sentence is correct. The portfolio assistant does not provide the workbench’s passage-level citation validation.",
      },
      {
        title: "Cost & performance",
        body: "A semantic cache hit skips retrieval and generation, but still pays for a query embedding. The cache implementation scans stored vectors, so its lookup cost grows with the cache. There is no published latency or cost benchmark here. Stage durations are observations for individual requests, not a service-level guarantee.",
      },
      {
        title: "Limitations & next steps",
        body: "Similarity alone can incorrectly reuse an answer to a related but different question. A useful next step is a versioned answer cache with expiry and a labelled question set for cache false positives. Retrieved résumé data also needs to be refreshed when portfolio content changes.",
      },
    ],
    decisions: [
      {
        title: "Keep provider access behind the server",
        context:
          "The interface needs streamed model output, but provider and service credentials must stay private.",
        decision:
          "Use a same-origin Next.js proxy and a separate backend service.",
        consequence:
          "The UI remains provider-independent, with an extra network hop and two services to configure.",
      },
      {
        title: "Expose execution events",
        context:
          "A spinner cannot explain whether a request is retrieving evidence or generating an answer.",
        decision:
          "Render the events emitted by the backend, without simulated stage completion.",
        consequence:
          "Visitors can inspect observed progress. A missing or interrupted stream must remain visibly incomplete.",
      },
    ],
    links: [{ label: "Try the assistant", href: "/lab#assistant" }],
    evidence:
      "Implementation: backend routes/ask.ts and services/cache.ts; frontend lib/backendProxy.ts and utils/chatStore.ts. This is a personal portfolio application, not a benchmark of production traffic.",
  },
  {
    slug: "document-investigation",
    title: "Document Investigation",
    category: "Personal project · Evidence & evaluation",
    year: "Ongoing",
    headline: "Change the evidence. Inspect the answer.",
    summary:
      "An interactive workbench for inspecting retrieval, following source passages, and comparing runs with different evidence.",
    contribution:
      "The document investigation workflow, source inspection UI, streamed event model, comparison, recorded replay, and export functionality in this portfolio.",
    technologies: ["TypeScript", "Pinecone", "Server-sent events", "React"],
    outcome:
      "A reproducible event trail from selected documents to a generated answer.",
    architecture: {
      caption:
        "Document investigation · each live run uses fresh retrieval. Open a stage for details.",
      nodes: [
        {
          name: "Select evidence",
          detail:
            "Choose from a prepared document collection. The selected document IDs and top-K setting become part of the run record.",
        },
        {
          name: "Embed & retrieve",
          detail:
            "Embed the question and query Pinecone with collection version and document filters. Returned matches are checked against the local corpus to reject excluded or stale evidence.",
        },
        {
          name: "Build context",
          detail:
            "Only the selected passages are supplied to generation. Unlike the portfolio assistant, this workflow adds neither a résumé fallback nor a semantic answer cache.",
        },
        {
          name: "Stream & inspect",
          detail:
            "The UI receives source passages before answer generation. Citation IDs map back to exact source offsets; citation checks validate references, not the factual truth of a claim.",
        },
        {
          name: "Compare & replay",
          detail:
            "Pin a completed run, change the evidence, and compare. Replay reconstructs a captured event log without a new model request. JSON export preserves the event history.",
        },
      ],
    },
    sections: [
      {
        title: "Problem & context",
        body: "A fluent answer can hide weak evidence. This workbench makes the retrieval inputs, source passages, model output, and failure states available for inspection. It is a portfolio demonstration with a small prepared corpus, including explicitly synthetic webhook examples.",
      },
      {
        title: "Implementation",
        body: "Documents are split by headings and paragraphs; long passages use 400-word windows with 60-word overlap. Each passage carries offsets into the original document. A typed event log records stage transitions, sources, answer deltas, and terminal status. Replay rebuilds the UI from those events.",
      },
      {
        title: "Evaluation approach",
        body: "Existing deterministic tests cover exact chunk offsets, selection validation, rejection of excluded or stale evidence, citation IDs, cancellation, replay, and fragmented SSE input. These checks evaluate pipeline behavior. They do not establish retrieval precision or answer quality on a representative question set.",
      },
      {
        title: "Failure analysis",
        body: "No retrieved evidence produces an explicit insufficient-evidence answer without a generation request. Interrupted runs retain their partial output and a terminal failure state. A citation pointing at a supplied passage can still make an unsupported claim; human source inspection remains necessary.",
      },
      {
        title: "Results & limitations",
        body: "Visitors can inspect sources, pin a baseline, alter document selection, replay a captured run, and export its event log. Recorded examples are labelled as recorded. The collection is deliberately small; results do not establish performance on arbitrary uploaded documents or private legal material.",
      },
    ],
    decisions: [
      {
        title: "Make evidence changes observable",
        context:
          "An answer cache or hidden résumé context would make document-exclusion comparisons misleading.",
        decision:
          "Use fresh retrieval and generation for each live investigation, with only selected evidence.",
        consequence:
          "Comparisons expose evidence changes, at the cost of another model request per live run.",
      },
      {
        title: "Replay events rather than regenerate",
        context:
          "Model output may differ between runs, and repeated requests incur cost.",
        decision: "Keep an ordered event log and replay it locally.",
        consequence:
          "A replay is reproducible, but represents a historical run and must be labelled accordingly.",
      },
    ],
    links: [{ label: "Open the workbench", href: "/lab/documents" }],
    evidence:
      "Implementation: backend src/lab and tests/lab; frontend components/lab and lib/lab. The example incident documents are synthetic. Recorded timing is not a current live measurement.",
  },
  {
    slug: "tuneprompt",
    title: "TunePrompt",
    category: "Open source · Developer tooling",
    year: "2025–2026",
    headline: "Give prompt iteration a testable workflow.",
    summary:
      "A TypeScript CLI for organizing prompt tests and inspecting model outputs in a repeatable developer workflow.",
    contribution:
      "Personal open-source project for prompt testing and evaluation tooling.",
    technologies: ["TypeScript", "CLI", "LLM evaluation"],
    outcome:
      "A public CLI with documented prompt-test configuration and execution.",
    sections: [
      {
        title: "Problem & context",
        body: "Manual prompt experimentation makes it difficult to compare changes consistently. TunePrompt brings prompts and expectations into a developer-oriented testing workflow.",
      },
      {
        title: "Workflow",
        body: "The public repository documents initializing a test configuration, running tests from the CLI, and inspecting their results. Provider configuration is supplied through environment variables.",
      },
      {
        title: "Engineering perspective",
        body: "Repeatable inputs make prompt changes easier to discuss. Passing a prompt test is still only evidence about those inputs: it cannot establish general model reliability. Evaluation criteria need to reflect the intended task and include difficult examples.",
      },
      {
        title: "Scope & limitations",
        body: "This overview covers the documented open-source CLI. Cloud services, caching performance, adoption counts, and latency claims are not independently established here. The repository is the reference for supported commands and current capabilities.",
      },
    ],
    links: [
      {
        label: "View repository",
        href: "https://github.com/CodeForgeNet/tuneprompt",
      },
    ],
    evidence:
      "Public repository and its documented CLI interface. No benchmark or download count is presented.",
  },
];

export const capabilities = [
  {
    title: "Evidence-aware AI workflows",
    detail:
      "Source analysis, typed evidence states, deterministic feasibility decisions, and controlled generation.",
    tools: "TypeScript · LLM workflows · guardrails",
    href: "/projects/evidence-gated-legal-drafting",
  },
  {
    title: "Evaluation & inspectability",
    detail:
      "Source inspection, deterministic pipeline checks, event replay, and explicit failure states.",
    tools: "SSE · citation checks · Node test runner",
    href: "/projects/document-investigation",
  },
  {
    title: "Full-stack delivery",
    detail:
      "Server-rendered interfaces, API boundaries, application state, and responsive product experiences.",
    tools: "Next.js · React · Express · Redis",
    href: "/projects/ai-portfolio",
  },
];

export const openSource = resume.open_source.map((entry) => ({
  project: entry.project,
  reference: entry.pr_number,
  href: entry.pr_url,
  description: entry.description,
  impact: entry.impact,
}));

export const experience = resume.experience.map((entry, index) => ({
  title: entry.title,
  organization: entry.organization,
  duration: entry.duration,
  type: entry.type,
  description: [
    "Evidence-gated legal drafting systems: document-specific analysis, typed workflow context, deterministic feasibility rules, guardrails, and controlled generation.",
    "Full-stack product engineering for real estate workflows, including authentication, CRM integrations, and real-time application state.",
    "Java development internship focused on Spring Boot services, database queries, and reusable application patterns.",
  ][index],
}));
