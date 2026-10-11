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
  const lines = jdText.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
  const searchableText = jdText.replace(/back to all roles\s*/i, "\n");
  const section = (start, ends) => {
    const startIndex = lines.findIndex((line) => start.test(line));
    if (startIndex < 0) return [];
    const following = lines.slice(startIndex + 1);
    const endIndex = following.findIndex((line) => ends.some((pattern) => pattern.test(line)));
    return (endIndex < 0 ? following : following.slice(0, endIndex)).filter((line) => line.length > 2);
  };
  const responsibilities = section(/^what (?:you.ll|you will) do$/i, [/^what we.re looking for$/i, /^requirements?$/i, /^nice to have$/i]);
  const requiredLines = section(/^(?:what we.re looking for|requirements?|qualifications?)$/i, [/^nice to have$/i, /^preferred/i, /^benefits?$/i]);
  const preferredLines = section(/^(?:nice to have|preferred(?: qualifications?)?)$/i, [/^benefits?$/i, /^about (?:us|the company)$/i]);
  const skills = [
    ["LLM-backed systems", /\bLLM(?:-backed)?\b/i], ["AI agents", /\bAI agents?\b/i], ["tool use", /\btool use\b/i],
    ["retrieval", /\bretrieval\b/i], ["evals", /\bevals?(?: frameworks?)?\b/i], ["monitoring", /\bmonitoring\b/i],
    ["guardrails", /\bguardrails?\b/i], ["retries", /\bretr(?:y|ies)\b/i], ["observability", /\bobservability\b/i],
    ["TypeScript", /\bTypeScript\b/i], ["Python", /\bPython\b/i], ["API development", /\bAPI(?: layer|s)?\b/i],
    ["databases", /\bdatabases?\b/i], ["frontend development", /\bfront[ -]?end\b/i], ["RAG", /\bRAG\b/i],
    ["agent orchestration", /\bagent orchestration\b/i], ["open-source work", /\bopen[ -]?source\b/i],
  ];
  const extractSkills = (text) => skills.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
  const requiredText = requiredLines.join(" ") || jdText;
  const preferredText = preferredLines.join(" ");
  const titleMatch = searchableText.match(/\b((?:AI|ML|Machine Learning|Software|Full[ -]?Stack|Backend|Frontend|Data)(?:\s+[A-Za-z]+){0,3}\s+(?:Engineer|Developer|Architect|Scientist|Manager|Specialist|Analyst))\b/i)
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
  return {
    roleTitle: modelRole && !/^unspecified(?: role)?$/i.test(modelRole) ? modelRole : fallback.roleTitle,
    seniority,
    minimumYears: Number.isFinite(Number(value.minimumYears)) ? Number(value.minimumYears) : fallback.minimumYears,
    requiredSkills: unique([...cleanModelItems(value.requiredSkills, 30), ...fallback.requiredSkills], 30),
    preferredSkills: unique([...cleanModelItems(value.preferredSkills, 30), ...fallback.preferredSkills], 30),
    responsibilities: unique([...cleanModelItems(value.responsibilities, 20), ...fallback.responsibilities], 20),
    educationRequirements: unique([...cleanModelItems(value.educationRequirements, 10), ...fallback.educationRequirements], 10)
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
  const fields = [value.roleTitle !== "Unspecified role", value.requiredSkills.length, value.preferredSkills.length, value.responsibilities.length];
  return fields.filter(Boolean).length / fields.length;
}
