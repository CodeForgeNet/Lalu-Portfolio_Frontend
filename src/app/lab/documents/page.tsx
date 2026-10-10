import type { Metadata } from "next";
import Workbench from "@/components/lab/Workbench";
import { getBackendCorpus } from "@/lib/backendProxy";
import recordedData from "@/data/lab/recorded-run.json";
import bundledCorpus from "@/data/lab/corpus.json";
import type { Corpus, Run } from "@/lib/lab/types";
export const metadata: Metadata = {
  title: "Document investigation",
  description:
    "Inspect retrieval, follow answer citations to their source, and compare what happens when the evidence changes.",
  alternates: { canonical: "/lab/documents" },
};
export const dynamic = "force-dynamic";
export default async function DocumentsPage() {
  let corpus: Corpus;
  let offline = false;
  try {
    corpus = await getBackendCorpus();
  } catch {
    corpus = bundledCorpus as Corpus;
    offline = true;
  }
  return (
    <Workbench
      corpus={corpus}
      recorded={recordedData.run as Run | null}
      offline={offline}
    />
  );
}
