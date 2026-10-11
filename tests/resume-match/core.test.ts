import test from "node:test";
import assert from "node:assert/strict";
import { analyzeMatch, classifySimilarity, cosineSimilarity, normalize } from "../../src/lib/resume-match/core.ts";
import type { JobProfile, ResumeEvidence } from "../../src/lib/resume-match/types.ts";

const evidence: ResumeEvidence[] = [
  { id: "skills", label: "AI skills", text: "TypeScript, React, Node.js, RAG pipelines" },
  { id: "experience", label: "AI Engineer", text: "Built production RAG systems and async Redis workers." },
];

test("normalization handles common technology aliases", () => {
  assert.equal(normalize("Node.js"), "node");
  assert.equal(normalize("JavaScript"), normalize("JS"));
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
  const result = analyzeMatch(job, 0.9, evidence, [[1, 0], [1, 0]], [[1, 0], [0.9, 0.1]]);
  assert.equal(result.score, 100);
  assert.equal(result.gaps.length, 0);
  assert.equal(result.breakdown.preferredSkills, 0);
});

test("insufficient job detail does not manufacture a score", () => {
  const job: JobProfile = { roleTitle: "Role", seniority: "unspecified", minimumYears: null, requiredSkills: [], preferredSkills: [], responsibilities: [], educationRequirements: [] };
  const result = analyzeMatch(job, 0.3, evidence, [], [[1, 0], [1, 0]]);
  assert.equal(result.score, null);
  assert.match(result.message || "", /Not enough/);
});
