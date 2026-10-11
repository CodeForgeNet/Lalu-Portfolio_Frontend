import type { Metadata } from "next";
import ResumeMatch from "@/components/lab/ResumeMatch";

export const metadata: Metadata = {
  title: "Resume match analyzer",
  description: "Compare a job description with Lalu's public engineering experience locally in your browser.",
  alternates: { canonical: "/lab/resume-match" },
};

export default function ResumeMatchPage() {
  return <ResumeMatch />;
}
