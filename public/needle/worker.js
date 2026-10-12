/* Needle 3.2 browser adapter. JD text never leaves this worker. */
importScripts("/needle/needle.js");

let moduleInstance;
let loaded = false;
let initialized = false;

const extractionTools = JSON.stringify([{
  type: "function",
  function: {
    name: "extract_job",
    description: "Extract a software job description into normalized recruiter-facing fields.",
    parameters: {
      type: "object",
      properties: {
        roleTitle: { type: "string" },
        seniority: { type: "string", enum: ["intern", "junior", "mid", "senior", "lead", "manager", "unspecified"] },
        minimumYears: { type: "number" },
        requiredSkills: { type: "array", items: { type: "string" } },
        preferredSkills: { type: "array", items: { type: "string" } },
        responsibilities: { type: "array", items: { type: "string" } },
        educationRequirements: { type: "array", items: { type: "string" } }
      },
      required: ["roleTitle", "seniority", "requiredSkills", "preferredSkills", "responsibilities", "educationRequirements"]
    }
  }
}]);

function errorText() {
  try { return moduleInstance.ccall("needle_last_error", "string", [], []) || "Needle runtime failed."; }
  catch { return "Needle runtime failed."; }
}

async function ensureReady() {
  if (loaded) return;
  self.postMessage({ type: "status", status: "loading" });
  moduleInstance = await self.createNeedle({ locateFile: (file) => `/needle/${file}` });
  const response = await fetch("/needle/needle3.cact", { credentials: "same-origin" });
  if (!response.ok) throw new Error(`Needle model unavailable (${response.status}).`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const pointer = moduleInstance._malloc(bytes.byteLength);
  moduleInstance.HEAPU8.set(bytes, pointer);
  const result = moduleInstance.ccall("needle_load", "number", ["number", "bigint"], [pointer, BigInt(bytes.byteLength)]);
  moduleInstance._free(pointer);
  if (result < 0) throw new Error(errorText());
  const initializedResult = moduleInstance.ccall("needle_init", "number", ["string", "string", "string"], ["You extract structured job requirements. Do not invent absent fields.", extractionTools, null]);
  if (initializedResult < 0) throw new Error(errorText());
  initialized = true;
  loaded = true;
  self.postMessage({ type: "status", status: "ready" });
}

function complete(input) {
  const capacity = 131072;
  const pointer = moduleInstance._malloc(capacity);
  const result = moduleInstance.ccall("needle_complete", "number", ["string", "number", "number", "number", "number", "number"], [input, 0, 0, 768, pointer, capacity]);
  if (result < 0) {
    moduleInstance._free(pointer);
    throw new Error(errorText());
  }
  const output = moduleInstance.UTF8ToString(pointer);
  moduleInstance._free(pointer);
  return JSON.parse(output);
}

function embed(input) {
  const count = moduleInstance.ccall("needle_embed", "number", ["string", "number", "number", "number", "number"], [input, 0, 0, 0, 0]);
  if (count <= 0) throw new Error(errorText());
  const pointer = moduleInstance._malloc(count * 4);
  const result = moduleInstance.ccall("needle_embed", "number", ["string", "number", "number", "number", "number"], [input, 0, 0, pointer, count]);
  if (result < 0) {
    moduleInstance._free(pointer);
    throw new Error(errorText());
  }
  const values = Array.from(new Float32Array(moduleInstance.HEAPU8.buffer, pointer, count));
  moduleInstance._free(pointer);
  return values;
}

function findExtraction(value, depth = 0) {
  if (!value || depth > 5) return null;
  if (typeof value === "string") {
    try { return findExtraction(JSON.parse(value), depth + 1); }
    catch { return null; }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findExtraction(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== "object") return null;
  if ("roleTitle" in value || "requiredSkills" in value || "responsibilities" in value) return value;
  for (const key of ["arguments", "function", "function_calls", "tool_calls", "calls", "suppressed_calls", "output", "result", "response", "data"]) {
    const found = findExtraction(value[key], depth + 1);
    if (found) return found;
  }
  return null;
}

function unique(values, limit) {
  return [...new Set(values.map((value) => String(value).replace(/^[-•*]\s*/, "").trim()).filter(Boolean))].slice(0, limit);
}

function fallbackExtraction(jdText) {
  const sourceText = jdText.replace(/&#(?:x20|32);|&nbsp;/gi, " ").replace(
    /\b(Role\s*&\s*Responsibilities|Key Responsibilities|Responsibilities|Skills\s*&\s*Qualifications|Required Skills\s*&\s*Qualifications|Requirements|Must[- ]Have|Good to Have|Nice to Have|Preferred Qualifications|Preferred|Who Will Thrive in This Role|What We Offer|Benefits\s*&\s*Culture Highlights)\b/gi,
    "\n$1\n",
  );
  const lines = sourceText.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
  const headingLines = lines.map((line) => line.replace(/^[*#\s]+|[*#\s:]+$/g, "").trim());
  const searchableText = sourceText.replace(/back to all roles\s*/i, "\n");
  const section = (start, ends) => {
    const startIndex = headingLines.findIndex((line) => start.test(line));
    if (startIndex < 0) return [];
    const following = lines.slice(startIndex + 1);
    const endIndex = headingLines.slice(startIndex + 1).findIndex((line) => ends.some((pattern) => pattern.test(line)));
    return (endIndex < 0 ? following : following.slice(0, endIndex)).filter((line) => line.length > 2);
  };
  const responsibilityHeading = /^(?:key\s+)?responsibilities(?:\s*&.*)?$|^role\s*&\s*responsibilities$|^what (?:you.ll|you will) do$/i;
  const requiredHeading = /^(?:required\s+)?(?:technical\s+)?(?:skills(?:\s*&\s*qualifications)?|requirements?|qualifications?)$|^must[- ]have$/i;
  const preferredHeading = /^(?:good\s+to\s+have|nice\s+to\s+have|preferred(?:\s+qualifications?)?)$/i;
  const sectionEnd = [requiredHeading, preferredHeading, /^benefits?(?:\s*&.*)?$/i, /^who will thrive/i, /^what we offer/i];
  const responsibilities = section(responsibilityHeading, sectionEnd).filter((line) => !/^(?:design\s*&\s*build|client\s*&\s*delivery|training\s*&\s*capability building)$/i.test(line));
  const requiredLines = section(requiredHeading, [preferredHeading, /^benefits?(?:\s*&.*)?$/i, /^who will thrive/i, /^what we offer/i]);
  const preferredLines = section(preferredHeading, [/^benefits?(?:\s*&.*)?$/i, /^about (?:us|the company)$/i, /^who will thrive/i, /^what we offer/i]);
  const skills = [
    ["LLM-backed systems", /\bLLM(?:-backed)?\b/i], ["AI agents", /\bAI agents?\b/i], ["tool use", /\btool use\b|\btool (?:and |\/)function calling\b/i],
    ["retrieval", /\bretrieval\b/i], ["evals", /\bevals?(?: frameworks?)?\b/i], ["AI/ML Ops monitoring", /\bmonitoring\b/i],
    ["guardrails", /\bguardrails?\b/i], ["retries", /\bretr(?:y|ies)\b/i], ["observability", /\bobservability\b/i],
    ["Python", /\bPython\b/i], ["Java", /\bJava\b/i], ["R", /\bR(?:\s+code|\s+programming)?\b/i], ["NumPy", /\bNumPy\b/i], ["Pandas", /\bPandas\b/i], ["Scikit-learn", /\bscikit[- ]learn\b/i],
    ["TensorFlow", /\bTensorFlow(?:\.js)?\b/i], ["PyTorch", /\bPyTorch\b/i], ["regression", /\bregression(?=\s*(?:,|and classification|models?|analysis))\b/i],
    ["classification", /\bclassification\b/i], ["clustering", /\bclustering\b/i], ["time series", /\btime series\b/i],
    ["NLP", /\bNLP\b|natural language processing/i], ["statistics", /\bstatistics?\b|statistical analysis/i], ["algorithms", /\balgorithms?\b/i], ["data structures", /\bdata structures?\b/i], ["data modeling", /\bdata modeling\b/i], ["software architecture", /\bsoftware architecture\b/i], ["recommendation systems", /\brecommendation systems?\b|user recommendations?/i], ["image tagging", /\bauto-tagging images?\b|image tagging/i], ["text-to-speech", /\btext-to-speech\b/i], ["feature engineering", /\bfeature engineering\b/i],
    ["hyperparameter tuning", /\bhyperparameter tuning\b/i], ["model optimization", /\bmodel optimization\b/i],
    ["MLflow", /\bMLflow\b/i], ["Weights & Biases", /\bWeights\s*&\s*Biases\b/i], ["pipeline automation", /\bpipeline automation\b/i],
    ["TypeScript", /\bTypeScript\b/i], ["FastAPI", /\bFastAPI\b/i], ["Flask", /\bFlask\b/i], ["API development", /\bREST APIs?\b|\bAPI(?: layer|s)?\b/i], ["async programming", /\basynchronous programming\b|\basync programming\b/i],
    ["Azure", /\bAzure(?: ML)?\b/i], ["AWS", /\bAWS\b|Amazon Web Services/i], ["GCP", /\bGCP\b|Google Cloud/i], ["Git", /\bGit\b/i],
    ["Docker", /\bDocker\b/i], ["Kubernetes", /\bKubernetes\b/i], ["feature stores", /\bfeature stores?\b/i],
    ["databases", /\bdatabases?\b/i], ["frontend development", /\bfront[ -]?end\b/i], ["RAG", /\bRAG\b/i],
    ["prompt engineering", /\bprompt engineering\b/i], ["fine-tuning", /\bfine[- ]tuning\b/i], ["LangChain", /\bLangChain\b/i],
    ["LlamaIndex", /\bLlamaIndex\b/i], ["OpenAI API", /\bOpenAI API\b/i], ["computer vision", /\bcomputer vision\b/i],
    ["Pinecone", /\bPinecone\b/i], ["Weaviate", /\bWeaviate\b/i], ["ChromaDB", /\bChromaDB\b/i], ["Azure ML", /\bAzure ML\b/i],
    ["agent orchestration", /\bagent orchestration\b|\borchestration and state management\b/i], ["agent memory", /\bagent memory\b/i],
    ["human-in-the-loop", /\bhuman-in-the-loop\b|\bhuman must approve\b/i], ["permissioning and sandboxing", /\bpermissioning and sandboxing\b/i],
    ["agent tracing", /\bLangfuse\b|\bLangSmith\b|\bArize Phoenix\b/i], ["MCP", /\bMCP\b|Model Context Protocol/i],
    ["LlamaIndex", /\bLlamaIndex\b/i], ["Semantic Kernel", /\bSemantic Kernel\b/i], ["Google ADK", /\bGoogle ADK\b/i],
    ["SQL and NoSQL", /\bSQL and NoSQL\b/i], ["CI/CD", /\bCI\/CD\b/i], ["IAM and secrets management", /\bIAM\b.*\bsecrets management\b/i],
    ["open-source work", /\bopen[ -]?source\b/i],
  ];
  const extractSkills = (text) => skills.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
  const requiredText = requiredLines.join(" ");
  const preferredText = preferredLines.join(" ");
  const titleMatch = searchableText.match(/\b((?:Lead|Senior|Staff|Principal|Junior)\s+(?:[A-Za-z&\/-]+\s+){0,7}(?:Engineer|Developer|Architect|Scientist|Manager|Specialist|Analyst))\b/i)
    || searchableText.match(/\b((?:AI[\/-]?ML|AI|ML|Machine Learning|Software|Full[ -]?Stack|Backend|Frontend|Data)(?:\s+[A-Za-z]+){0,3}\s+(?:Engineer|Developer|Architect|Scientist|Manager|Specialist|Analyst))\b/i)
    || searchableText.match(/\b((?:Senior|Staff|Lead|Principal|Junior)?\s*(?:Engineer|Developer|Architect|Scientist|Manager|Specialist|Analyst))\b/i);
  const yearsMatch = jdText.match(/\b(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim() || "Unspecified role";
  const seniorityMatch = title.match(/\b(intern|junior|mid|senior|staff|lead|principal|manager)\b/i);
  const seniority = seniorityMatch ? seniorityMatch[1].toLowerCase().replace(/staff|principal/, "lead") : "unspecified";
  return {
    roleTitle: title,
    seniority,
    minimumYears: yearsMatch ? Number(yearsMatch[1]) : null,
    requiredSkills: unique(extractSkills(requiredText), 30),
    preferredSkills: unique(extractSkills(preferredText), 30),
    responsibilities: unique(responsibilities, 20),
    educationRequirements: unique(lines.filter((line) => /\b(?:bachelor|master|degree|certification)\b/i.test(line)), 10),
    hasRequiredSection: headingLines.some((line) => requiredHeading.test(line)),
    hasPreferredSection: headingLines.some((line) => preferredHeading.test(line)),
    hasResponsibilitySection: headingLines.some((line) => responsibilityHeading.test(line)),
  };
}

function parseExtraction(result, jdText) {
  const value = findExtraction(result) || {};
  const fallback = fallbackExtraction(jdText);
  const modelRole = String(value.roleTitle || "").trim();
  const seniority = ["intern", "junior", "mid", "senior", "lead", "manager", "unspecified"].includes(String(value.seniority).toLowerCase())
    ? String(value.seniority).toLowerCase()
    : fallback.seniority;
  const cleanModelItems = (items, limit) => Array.isArray(items) ? unique(items.filter((item) => String(item).length <= 160), limit) : [];
  const canonical = (item) => String(item).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const requiredSkills = fallback.hasRequiredSection ? fallback.requiredSkills : unique([...cleanModelItems(value.requiredSkills, 30), ...fallback.requiredSkills], 30);
  const preferredSkills = fallback.hasPreferredSection ? fallback.preferredSkills : unique([...cleanModelItems(value.preferredSkills, 30), ...fallback.preferredSkills], 30);
  const requiredSet = new Set(requiredSkills.map(canonical));
  return {
    roleTitle: fallback.roleTitle !== "Unspecified role" ? fallback.roleTitle : modelRole,
    seniority,
    minimumYears: value.minimumYears !== null && value.minimumYears !== undefined && Number.isFinite(Number(value.minimumYears)) ? Number(value.minimumYears) : fallback.minimumYears,
    requiredSkills,
    preferredSkills: preferredSkills.filter((item) => !requiredSet.has(canonical(item))),
    responsibilities: fallback.hasResponsibilitySection ? fallback.responsibilities : unique([...cleanModelItems(value.responsibilities, 20), ...fallback.responsibilities], 20),
    educationRequirements: fallback.educationRequirements
  };
}

self.onmessage = async (event) => {
  const message = event.data;
  try {
    if (message.type === "reset") {
      if (initialized) moduleInstance.ccall("needle_reset", null, [], []);
      self.postMessage({ type: "status", status: loaded ? "ready" : "loading" });
      return;
    }
    await ensureReady();
    if (message.type !== "analyze") return;
    self.postMessage({ type: "status", status: "analyzing" });
    moduleInstance.ccall("needle_reset", null, [], []);
    const completion = complete(`Extract this job description. Return only the extract_job call.\n\n${message.jdText}`);
    const extracted = parseExtraction(completion, message.jdText);
    const requirements = [...extracted.requiredSkills, ...extracted.preferredSkills, ...extracted.responsibilities, ...extracted.educationRequirements];
    const embeddings = [...requirements, ...message.evidence.map((item) => item.text)].map(embed);
    const evidenceCount = message.evidence.length;
    self.postMessage({ type: "result", job: extracted, confidence: resultConfidence(extracted), embeddings: [embeddings.slice(0, requirements.length), embeddings.slice(requirements.length, requirements.length + evidenceCount)] });
    self.postMessage({ type: "status", status: "ready" });
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Local analysis failed." });
  }
};

function resultConfidence(value) {
  return (value.roleTitle !== "Unspecified role" ? 0.25 : 0)
    + (value.requiredSkills.length ? 0.375 : 0)
    + (value.responsibilities.length ? 0.375 : 0);
}
