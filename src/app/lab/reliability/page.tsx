import type { Metadata } from "next";
import ReliabilityLab from "@/components/lab/ReliabilityLab";
import { getReliabilityScenarios } from "@/lib/backendProxy";
import { fallbackScenarios } from "@/lib/reliability";

export const metadata: Metadata = {
  title: "AI reliability lab",
  description: "Break curated RAG failure cases and inspect transparent guardrail checks.",
  alternates: { canonical: "/lab/reliability" },
};
export const dynamic = "force-dynamic";

export default async function ReliabilityPage() {
  let scenarios = fallbackScenarios;
  let offline = true;
  try { scenarios = await getReliabilityScenarios(); offline = false; } catch { /* bundled replay remains available */ }
  return <ReliabilityLab scenarios={scenarios} offline={offline} />;
}
