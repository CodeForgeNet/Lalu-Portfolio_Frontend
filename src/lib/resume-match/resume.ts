import resume from "@/data/resume.json";
import type { ResumeEvidence } from "./types";

type ResumeData = typeof resume;

export const resumeExperienceYears = 32 / 12;

export function buildResumeEvidence(data: ResumeData = resume): ResumeEvidence[] {
  const evidence: ResumeEvidence[] = [];
  const add = (id: string, label: string, text: string) => {
    const value = text.trim();
    if (value) evidence.push({ id, label, text: value });
  };

  for (const [group, skills] of Object.entries(data.technical_skills)) {
    add(`skills-${group}`, `Technical skills · ${group.replaceAll("_", " ")}`, skills.join(", "));
  }
  data.experience.forEach((item, index) => {
    add(`experience-${index}`, `${item.title} · ${item.organization}`, `${item.title} at ${item.organization}. ${item.details.join(" ")}`);
  });
  data.projects.forEach((item) => {
    add(`project-${item.id}`, item.title, `${item.title}. ${item.summary} Technologies: ${item.technologies.join(", ")}.`);
  });
  data.education.forEach((item, index) => add(`education-${index}`, item.degree, `${item.degree} from ${item.institution}.`));
  data.certifications.forEach((item, index) => add(`certification-${index}`, item.title, `${item.title} from ${item.organization}. Skills: ${item.skills.join(", ")}.`));
  return evidence;
}
