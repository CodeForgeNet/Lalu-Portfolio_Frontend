export type MatchStatus = "match" | "partial" | "gap";

export type JobProfile = {
  roleTitle: string;
  seniority: string;
  minimumYears: number | null;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  educationRequirements: string[];
};

export type ResumeEvidence = {
  id: string;
  label: string;
  text: string;
};

export type ExtractedMatch = {
  requirement: string;
  evidence: string[];
  evidenceText?: string;
  section?: "requiredSkills" | "preferredSkills" | "responsibilities" | "education";
  similarity: number;
  status: MatchStatus;
};

export type ScoreBreakdown = {
  requiredSkills: number;
  preferredSkills: number;
  responsibilities: number;
  experience: number;
  education: number;
};

export type MatchAnalysis = {
  score: number | null;
  message?: string;
  confidence: number;
  job: JobProfile;
  breakdown: ScoreBreakdown;
  matched: ExtractedMatch[];
  partial: ExtractedMatch[];
  gaps: ExtractedMatch[];
  interviewQuestions: string[];
  resumeEvidence: ResumeEvidence[];
};

export type NeedleAnalysisRequest = {
  type: "analyze";
  jdText: string;
  evidence: ResumeEvidence[];
};

export type NeedleWorkerMessage =
  | { type: "init" }
  | NeedleAnalysisRequest
  | { type: "reset" };

export type NeedleWorkerResponse =
  | { type: "status"; status: "loading" | "ready" | "analyzing" }
  | { type: "result"; job: JobProfile; confidence: number; embeddings: number[][][] }
  | { type: "error"; message: string };
