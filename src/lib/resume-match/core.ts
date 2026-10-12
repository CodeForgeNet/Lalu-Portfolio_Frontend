import type { ExtractedMatch, JobProfile, MatchAnalysis, MatchStatus, ResumeEvidence, ScoreBreakdown } from "./types";

export const LIMITS = { minChars: 200, maxChars: 20_000 } as const;
export const THRESHOLDS = { match: 0.78, partial: 0.62, coverage: 0.75 } as const;

export function calculateExperienceYears(referenceDate = new Date()): number {
  const careerStart = Date.UTC(2024, 0, 1);
  return Math.max(0, (referenceDate.getTime() - careerStart) / (365.2425 * 24 * 60 * 60 * 1000));
}

const aliases: Record<string, string> = {
  javascript: "javascript", js: "javascript", typescript: "typescript", ts: "typescript",
  "node.js": "node", "node js": "node", nodejs: "node", node: "node", "react.js": "react", "react js": "react", react: "react",
  "next.js": "nextjs", "next js": "nextjs", nextjs: "nextjs", postgres: "postgresql", postgresql: "postgresql",
  "google cloud": "gcp", gcp: "gcp", aws: "aws", "amazon web services": "aws",
  "rest api": "rest apis", "rest apis": "rest apis", "machine learning": "machine learning",
};

export function normalize(value: string): string {
  const cleaned = value.toLowerCase().replace(/[+/#.]/g, " ").replace(/[^a-z0-9\s-]/g, " ").replace(/\bgoogle cloud(?: platform)?\b/g, "gcp").replace(/\bcloud run\b/g, "gcp cloud run").replace(/\s+/g, " ").trim();
  return aliases[cleaned] || cleaned;
}

export function cosineSimilarity(left: number[], right: number[]): number {
  const length = Math.min(left.length, right.length);
  let dot = 0, leftNorm = 0, rightNorm = 0;
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }
  return leftNorm && rightNorm ? dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm)) : 0;
}

export function classifySimilarity(similarity: number): MatchStatus {
  if (similarity >= THRESHOLDS.match) return "match";
  if (similarity >= THRESHOLDS.partial) return "partial";
  return "gap";
}

const stopwords = new Set(["and", "the", "for", "with", "from", "into", "via", "using", "both", "this", "that", "will", "model", "models", "programming", "work"]);

function requirementMatches(requirement: string, section: ExtractedMatch["section"], evidence: ResumeEvidence[], requirementEmbedding: number[], evidenceEmbeddings: number[][]): ExtractedMatch {
  const normalizedRequirement = normalize(requirement);
  const exact = section === "responsibilities" || normalizedRequirement.length < 3 ? undefined : evidence.find((item) => normalize(item.text).includes(normalizedRequirement) || normalize(normalizedRequirement).includes(normalize(item.text)));
  const tokens = normalizedRequirement.split(" ").filter((token) => token.length > 2 && !stopwords.has(token));
  const hasLexicalSupport = (text: string) => {
    if (!tokens.length) return false;
    const evidenceText = normalize(text);
    const overlap = tokens.filter((token) => evidenceText.includes(token)).length;
    return section === "responsibilities"
      ? overlap >= Math.min(3, tokens.length)
      : tokens.length <= 1
      ? tokens.every((token) => evidenceText.includes(token))
      : overlap >= 2;
  };
  const candidates = evidence.map((item, index) => ({
    item,
    claimOnly: item.id.startsWith("skills-") || item.id.startsWith("certification-"),
    lexicalSupport: exact?.id === item.id || hasLexicalSupport(item.text),
    similarity: exact?.id === item.id ? 1 : cosineSimilarity(requirementEmbedding, evidenceEmbeddings[index] || []),
  })).filter(({ item }) => section !== "responsibilities" || (!item.id.startsWith("skills-") && !item.id.startsWith("certification-")))
    .filter(({ item }) => section !== "education" || item.id.startsWith("education-"))
    .sort((a, b) => Number(b.lexicalSupport) - Number(a.lexicalSupport) || Number(a.claimOnly) - Number(b.claimOnly) || b.similarity - a.similarity);
  const best = candidates[0] || { item: { id: "none", label: "No evidence", text: "" }, similarity: 0, lexicalSupport: false, claimOnly: false };
  const status = best.lexicalSupport
    ? best.claimOnly ? "partial" : tokens.length === 1 ? "match" : classifySimilarity(best.similarity)
    : section === "responsibilities" && best.similarity >= THRESHOLDS.match ? "partial" : "gap";
  const hasEvidence = status !== "gap";
  return { requirement, evidence: hasEvidence ? [best.item.label] : [], evidenceText: hasEvidence ? best.item.text : undefined, section, similarity: best.similarity, status };
}

function sectionScore(items: ExtractedMatch[]): number | null {
  if (!items.length) return null;
  return items.reduce((sum, item) => sum + (item.status === "match" ? 1 : item.status === "partial" ? 0.5 : 0), 0) / items.length;
}

function parseYears(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return Math.max(0, value);
}

function scoreSections(scores: Array<[keyof ScoreBreakdown, number | null, number]>) {
  const available = scores.filter(([, score]) => score !== null);
  if (available.length < 2) return { score: null, breakdown: Object.fromEntries(scores.map(([key]) => [key, 0])) as ScoreBreakdown };
  const totalWeight = available.reduce((sum, [, , weight]) => sum + weight, 0);
  const breakdown = Object.fromEntries(scores.map(([key, score, weight]) => [key, score === null ? 0 : Math.round((score * weight / totalWeight) * 100)])) as ScoreBreakdown;
  return { score: Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0)), breakdown };
}

export function analyzeMatch(job: JobProfile, confidence: number, evidence: ResumeEvidence[], requirementEmbeddings: number[][], evidenceEmbeddings: number[][], candidateExperienceYears = 0): MatchAnalysis {
  const required = job.requiredSkills.map((item, index) => requirementMatches(item, "requiredSkills", evidence, requirementEmbeddings[index] || [], evidenceEmbeddings));
  const preferredOffset = required.length;
  const preferred = job.preferredSkills.map((item, index) => requirementMatches(item, "preferredSkills", evidence, requirementEmbeddings[preferredOffset + index] || [], evidenceEmbeddings));
  const responsibilityOffset = preferredOffset + preferred.length;
  const responsibilities = job.responsibilities.map((item, index) => requirementMatches(item, "responsibilities", evidence, requirementEmbeddings[responsibilityOffset + index] || [], evidenceEmbeddings));
  const educationOffset = responsibilityOffset + responsibilities.length;
  const education = job.educationRequirements.map((item, index) => requirementMatches(item, "education", evidence, requirementEmbeddings[educationOffset + index] || [], evidenceEmbeddings));
  const requiredYears = parseYears(job.minimumYears);
  const hasSeniority = Boolean(job.seniority && job.seniority !== "unspecified");
  const experienceScore = job.minimumYears === null && !hasSeniority ? null : requiredYears !== null ? candidateExperienceYears >= requiredYears ? 1 : candidateExperienceYears >= requiredYears - 1 ? 0.5 : 0 : 0.5;
  const isLeadershipRole = requiredYears !== null && requiredYears >= 5 || ["lead", "manager"].includes(job.seniority);
  const coverageReady = confidence >= THRESHOLDS.coverage && required.length > 0 && responsibilities.length > 0;
  const sections = coverageReady ? scoreSections([
      ["requiredSkills", sectionScore(required), isLeadershipRole ? 40 : 45],
      ["preferredSkills", sectionScore(preferred), isLeadershipRole ? 5 : 10],
      ["responsibilities", sectionScore(responsibilities), 25],
      ["experience", experienceScore, isLeadershipRole ? 30 : 15],
      ["education", sectionScore(education), 5],
    ]) : { score: null, breakdown: { requiredSkills: 0, preferredSkills: 0, responsibilities: 0, experience: 0, education: 0 } };
  const experienceGap = requiredYears !== null && candidateExperienceYears < requiredYears
    ? `Resume shows ${candidateExperienceYears.toFixed(1)} years against stated ${requiredYears}+ year minimum.`
    : undefined;
  const all = [...required, ...preferred, ...responsibilities, ...education];
  return {
    score: sections.score,
    message: sections.score === null ? "Insufficient extraction coverage to calculate a reliable score." : experienceGap,
    confidence,
    job,
    breakdown: sections.breakdown,
    matched: all.filter((item) => item.status === "match"),
    partial: all.filter((item) => item.status === "partial"),
    gaps: all.filter((item) => item.status === "gap"),
    interviewQuestions: ["Which missing or partial requirements are essential on day one?", "Which responsibilities need the strongest evidence during interview?", "What level of ownership does this role expect?"],
    resumeEvidence: evidence,
  };
}
