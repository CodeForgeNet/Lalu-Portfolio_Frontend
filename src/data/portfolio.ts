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
    title: "Retrieval & AI applications",
    detail:
      "Question embeddings, vector search, context assembly, and streamed generation.",
    tools: "Pinecone · provider APIs · TypeScript",
    href: "/projects/ai-portfolio",
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
export const experience = resume.experience.map((entry, index) => ({
  title: entry.title,
  organization: entry.organization,
  duration: entry.duration,
  type: entry.type,
  description: [
    "AI legal document products and evidence-oriented workflows. My work spans AI application development and full-stack product engineering.",
    "Full-stack product engineering for real estate workflows, including authentication, CRM integrations, and real-time application state.",
    "Java development apprenticeship focused on Spring Boot services, database queries, and reusable application patterns.",
  ][index],
}));
