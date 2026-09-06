import type { Metadata } from "next";
import Workbench from "@/components/lab/Workbench";
import { corpus } from "@/lib/lab/server";
import recordedData from "@/data/lab/recorded-run.json";
import type { Run } from "@/lib/lab/types";

export const metadata: Metadata = { title: "Document Investigation | Lalu's Lab", description: "Inspect live retrieval, follow answer citations to their source, and compare what happens when the evidence changes." };

export default function DocumentsPage() {
  return <Workbench corpus={corpus} recorded={recordedData.run as Run | null} />;
}
