import type { Metadata } from "next";
import Workbench from "@/components/lab/Workbench";
import { getBackendCorpus } from "@/lib/backendProxy";
import recordedData from "@/data/lab/recorded-run.json";
import type { Run } from "@/lib/lab/types";

export const metadata: Metadata = { title: "Document Investigation | Lalu's Lab", description: "Inspect live retrieval, follow answer citations to their source, and compare what happens when the evidence changes." };
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const corpus = await getBackendCorpus();
  return <Workbench corpus={corpus} recorded={recordedData.run as Run | null} />;
}
