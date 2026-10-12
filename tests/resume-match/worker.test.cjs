/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

const source = fs.readFileSync(require("node:path").join(__dirname, "../../public/needle/worker.js"), "utf8");
const context = {
  self: { postMessage() {} },
  importScripts() {},
  fetch() {},
  console,
};
vm.createContext(context);
vm.runInContext(source, context);

const jd = `Apply For AI/ML Developer
Location: Ahmedabad, India
Experience: 2+ Years

Key Responsibilities
- Design, develop, and deploy machine learning models.
- Build and maintain ML pipelines for batch and real-time prediction.
- Monitor deployed models for data drift and retraining triggers.

Required Skills & Qualifications
- Strong proficiency in Python, including NumPy, Pandas, and Scikit-learn.
- Experience with TensorFlow or PyTorch.
- Understanding of regression, classification, clustering, time series, and NLP.
- Experience with feature engineering and hyperparameter tuning.

Good to Have
- Large Language Models, prompt engineering, and RAG.
- LangChain, Pinecone, Docker, Kubernetes, or Azure ML.

Who Will Thrive in This Role
Someone excited about AI engineering.`;

test("worker fallback keeps required and preferred sections separate", () => {
  const fallback = context.fallbackExtraction(jd);
  assert.equal(fallback.roleTitle, "AI/ML Developer");
  assert.equal(fallback.minimumYears, 2);
  assert.ok(fallback.responsibilities.length >= 3);
  for (const skill of ["Python", "NumPy", "Pandas", "Scikit-learn", "TensorFlow", "PyTorch", "clustering", "time series", "NLP", "feature engineering", "hyperparameter tuning"]) {
    assert.ok(fallback.requiredSkills.includes(skill), `missing required skill: ${skill}`);
  }
  for (const skill of ["RAG", "LangChain", "Pinecone", "Docker", "Kubernetes", "Azure ML"]) {
    assert.ok(fallback.preferredSkills.includes(skill), `missing preferred skill: ${skill}`);
    assert.equal(fallback.requiredSkills.includes(skill), false, `preferred skill leaked into required: ${skill}`);
  }
});

test("recognized sections override contradictory model fields", () => {
  const parsed = context.parseExtraction({
    roleTitle: "AI/ML Developer",
    seniority: "mid",
    minimumYears: 2,
    requiredSkills: ["RAG"],
    preferredSkills: ["Python"],
    responsibilities: [],
    educationRequirements: [],
  }, jd);
  assert.equal(parsed.requiredSkills.includes("RAG"), false);
  assert.equal(parsed.preferredSkills.includes("Python"), false);
  assert.ok(parsed.requiredSkills.includes("Python"));
  assert.ok(parsed.preferredSkills.includes("RAG"));
  assert.ok(context.resultConfidence(parsed) >= 0.75);
});

test("fallback recognizes inline headings from copied rich text", () => {
  const inlineHeadings = jd.replace(/\n(Key Responsibilities|Required Skills & Qualifications|Good to Have)\n/g, " $1 ");
  const fallback = context.fallbackExtraction(inlineHeadings);
  assert.ok(fallback.responsibilities.length >= 3);
  assert.ok(fallback.requiredSkills.includes("Python"));
  assert.ok(fallback.preferredSkills.includes("RAG"));
});

test("fallback recognizes role responsibilities and nested must-have sections", () => {
  const alternateJd = `Apply For AI/ML Developer

Role & Responsibilities
Design, train, and deploy scalable ML models.
Monitor model drift and implement retraining workflows.

Skills & Qualifications
Must-Have
Python
TensorFlow
PyTorch
scikit-learn
MLflow
Docker
Git
REST API
Preferred
LangChain
FastAPI
Azure ML

Benefits & Culture Highlights
Mentorship and modern infrastructure.`;
  const fallback = context.fallbackExtraction(alternateJd);
  assert.ok(fallback.responsibilities.length >= 2);
  assert.ok(fallback.requiredSkills.includes("Python"));
  assert.ok(fallback.requiredSkills.includes("MLflow"));
  assert.ok(fallback.preferredSkills.includes("LangChain"));
  assert.ok(fallback.preferredSkills.includes("Azure ML"));
});

test("fallback strips markdown headings and keeps soft prose out of skills", () => {
  const markdownJd = `**Responsibilities:**
- Designing machine learning systems and predictive models.
- Running tests and performing statistical analysis.

**Requirements:**
- Bachelor's degree in computer science or related field.
- Advanced proficiency with Python, Java, and R code writing.
- Extensive knowledge of ML frameworks, data structures, data modeling, and software architecture.
- In-depth knowledge of mathematics, statistics, and algorithms.
`;
  const fallback = context.fallbackExtraction(markdownJd);
  assert.equal(fallback.hasResponsibilitySection, true);
  assert.equal(fallback.hasRequiredSection, true);
  assert.ok(fallback.responsibilities.length >= 2);
  for (const skill of ["Python", "Java", "R", "data structures", "data modeling", "software architecture", "statistics", "algorithms"]) {
    assert.ok(fallback.requiredSkills.includes(skill), `missing required skill: ${skill}`);
  }
  assert.equal(fallback.requiredSkills.includes("Superb"), false);
});

test("lead JD keeps technical requirements separate and does not invent education", () => {
  const leadJd = `Experience: 5+ years
Role Summary
We are looking for a Lead Gen AI & Agentic AI Engineer to own delivery.

Key Responsibilities
Design & Build
Own end-to-end design of Gen AI solutions.
Client & Delivery
Work directly with client stakeholders.
Training & Capability Building
Mentor associate engineers.

Required Technical Skills
Strong Python, including asynchronous programming.
FastAPI, SQL and NoSQL, LangChain / LlamaIndex, MCP, Docker, and CI/CD.

Good to Have
Fine-tuning open-source models.`;
  const fallback = context.fallbackExtraction(leadJd);
  const parsed = context.parseExtraction({
    roleTitle: "AI Engineer",
    seniority: "lead",
    minimumYears: 5,
    requiredSkills: [],
    preferredSkills: [],
    responsibilities: [],
    educationRequirements: ["Bachelor's degree"],
  }, leadJd);
  assert.equal(fallback.roleTitle, "Lead Gen AI & Agentic AI Engineer");
  assert.equal(fallback.responsibilities.length, 3);
  assert.ok(fallback.requiredSkills.includes("Python"));
  assert.ok(fallback.requiredSkills.includes("LlamaIndex"));
  assert.ok(fallback.requiredSkills.includes("MCP"));
  assert.ok(fallback.preferredSkills.includes("fine-tuning"));
  assert.deepEqual(Array.from(parsed.educationRequirements), []);
});

test("regression suites are not misread as predictive regression", () => {
  const evaluationJd = `AI Engineer

Required Technical Skills
Build regression suites for non-deterministic LLM output.

Good to Have
Lightweight AI/ML Ops exposure with production monitoring.`;
  const fallback = context.fallbackExtraction(evaluationJd);
  assert.equal(fallback.requiredSkills.includes("regression"), false);
  assert.ok(fallback.preferredSkills.includes("AI/ML Ops monitoring"));
});
