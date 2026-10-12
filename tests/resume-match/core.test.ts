import test from "node:test";
import assert from "node:assert/strict";
import { analyzeMatch, calculateExperienceYears, classifySimilarity, cosineSimilarity, normalize } from "../../src/lib/resume-match/core.ts";
import type { JobProfile, ResumeEvidence } from "../../src/lib/resume-match/types.ts";

const evidence: ResumeEvidence[] = [
  { id: "skills", label: "AI skills", text: "TypeScript, React, Node.js, RAG pipelines" },
  { id: "experience", label: "AI Engineer", text: "Built production RAG systems and async Redis workers." },
];

test("normalization handles common technology aliases", () => {
  assert.equal(normalize("Node.js"), "node");
  assert.equal(normalize("JavaScript"), normalize("JS"));
  assert.match(normalize("Deployed on Google Cloud Run"), /gcp/);
});

test("cosine and thresholds classify deterministic evidence", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(classifySimilarity(0.8), "match");
  assert.equal(classifySimilarity(0.7), "partial");
  assert.equal(classifySimilarity(0.2), "gap");
});

test("score redistributes missing sections and returns evidence groups", () => {
  const job: JobProfile = {
    roleTitle: "Senior AI Engineer",
    seniority: "senior",
    minimumYears: 2,
    requiredSkills: ["TypeScript"],
    preferredSkills: [],
    responsibilities: ["Build production RAG systems"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 0.9, evidence, [[1, 0], [1, 0]], [[1, 0], [0.9, 0.1]], 2);
  assert.equal(result.score, 100);
  assert.equal(result.gaps.length, 0);
  assert.equal(result.breakdown.preferredSkills, 0);
});

test("insufficient job detail does not manufacture a score", () => {
  const job: JobProfile = { roleTitle: "Role", seniority: "unspecified", minimumYears: null, requiredSkills: [], preferredSkills: [], responsibilities: [], educationRequirements: [] };
  const result = analyzeMatch(job, 0.3, evidence, [], [[1, 0], [1, 0]]);
  assert.equal(result.score, null);
  assert.match(result.message || "", /Insufficient extraction coverage/);
});

test("weak extraction coverage returns no numeric score", () => {
  const job: JobProfile = {
    roleTitle: "AI/ML Developer",
    seniority: "mid",
    minimumYears: 2,
    requiredSkills: ["Python"],
    preferredSkills: [],
    responsibilities: ["Deploy models"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 0.5, evidence, [[1, 0], [1, 0]], [[1, 0], [1, 0]]);
  assert.equal(result.score, null);
  assert.match(result.message || "", /Insufficient extraction coverage/);
});

test("semantic-only skills are gaps while strong delivery similarity stays partial", () => {
  const job: JobProfile = {
    roleTitle: "ML Developer",
    seniority: "mid",
    minimumYears: 2,
    requiredSkills: ["Python"],
    preferredSkills: [],
    responsibilities: ["Build models"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 1, [{ id: "other", label: "Other", text: "JavaScript" }], [[1, 0], [1, 0]], [[1, 0]]);
  assert.equal(result.matched.length, 0);
  assert.equal(result.partial.length, 1);
  assert.equal(result.gaps.some((item) => item.requirement === "Python"), true);
});

test("single-letter R requirement needs explicit evidence", () => {
  const job: JobProfile = {
    roleTitle: "Machine Learning Engineer",
    seniority: "unspecified",
    minimumYears: null,
    requiredSkills: ["R"],
    preferredSkills: [],
    responsibilities: ["Build models"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 1, [{ id: "skills", label: "Languages", text: "Python, Java, TypeScript" }], [[1, 0], [1, 0]], [[1, 0]]);
  assert.equal(result.matched.some((item) => item.requirement === "R"), false);
});

test("experience derives from career start instead of a stale constant", () => {
  assert.ok(Math.abs(calculateExperienceYears(new Date("2026-01-01T00:00:00Z")) - 2) < 0.01);
});

test("lead roles give stated experience requirements first-class weight", () => {
  const job: JobProfile = {
    roleTitle: "Lead AI Engineer",
    seniority: "lead",
    minimumYears: 5,
    requiredSkills: ["Python"],
    preferredSkills: [],
    responsibilities: ["Build production AI systems"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 1, [
    { id: "skills", label: "Skills", text: "Python" },
    { id: "project", label: "Project", text: "Built production AI systems" },
  ], [[1, 0], [1, 0]], [[1, 0], [1, 0]], 2.8);
  assert.equal(result.score, 55);
  assert.match(result.message || "", /2\.8 years.*5\+ year minimum/);
});

test("responsibilities require delivery evidence, not a skills list", () => {
  const job: JobProfile = {
    roleTitle: "AI Engineer",
    seniority: "mid",
    minimumYears: null,
    requiredSkills: ["Python"],
    preferredSkills: [],
    responsibilities: ["Mentor engineers"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 1, [{ id: "skills-ai", label: "Skills", text: "Python, mentoring engineers" }], [[1, 0], [1, 0]], [[1, 0]], 3);
  assert.equal(result.matched.some((item) => item.requirement === "Mentor engineers"), false);
});

test("skill-list claims stay partial until delivery evidence corroborates them", () => {
  const job: JobProfile = {
    roleTitle: "AI Engineer",
    seniority: "mid",
    minimumYears: null,
    requiredSkills: ["Fine-tuning", "Python"],
    preferredSkills: [],
    responsibilities: ["Build Python systems"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 1, [
    { id: "skills-ai", label: "AI skills", text: "Fine-tuning, Python" },
    { id: "project-python", label: "Python project", text: "Built and shipped Python systems" },
  ], [[1, 0], [1, 0], [1, 0]], [[1, 0], [1, 0]], 3);
  assert.equal(result.partial.some((item) => item.requirement === "Fine-tuning"), true);
  assert.equal(result.matched.some((item) => item.requirement === "Python"), true);
});

test("related concepts do not become skill evidence", () => {
  const job: JobProfile = {
    roleTitle: "AI Engineer",
    seniority: "mid",
    minimumYears: null,
    requiredSkills: ["Azure ML", "agent tracing", "LlamaIndex"],
    preferredSkills: [],
    responsibilities: ["Build AI systems"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 1, [
    { id: "project", label: "AI project", text: "Built AI systems with AWS, prompt evaluation, and LangChain" },
  ], [[1, 0], [1, 0], [1, 0], [1, 0]], [[1, 0]], 3);
  assert.deepEqual(result.gaps.filter((item) => item.section === "requiredSkills").map((item) => item.requirement), ["Azure ML", "agent tracing", "LlamaIndex"]);
});

test("demonstrated async and open-source work count without generic filler words", () => {
  const job: JobProfile = {
    roleTitle: "AI Engineer",
    seniority: "mid",
    minimumYears: null,
    requiredSkills: ["async programming", "open-source work", "GCP"],
    preferredSkills: [],
    responsibilities: ["Build systems"],
    educationRequirements: [],
  };
  const result = analyzeMatch(job, 1, [
    { id: "open-source", label: "Contribution", text: "Open-source work replacing blocking code with an async pattern" },
    { id: "project-gcp", label: "Cloud service", text: "Deployed production traffic on Cloud Run" },
  ], [[1, 0], [1, 0], [1, 0], [1, 0]], [[0, 1], [0, 1]], 3);
  for (const requirement of ["async programming", "open-source work", "GCP"]) {
    assert.equal(result.matched.some((item) => item.requirement === requirement), true, `missing demonstrated skill: ${requirement}`);
  }
});
