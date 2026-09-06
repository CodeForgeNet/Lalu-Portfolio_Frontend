import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareCorpus } from "./lab-corpus.ts";
import { GooglePineconeProvider, namespaceFor, readConfig } from "../src/lib/lab/providers.ts";
import { executeRun } from "../src/lib/lab/pipeline.ts";
import { replayRun } from "../src/lib/lab/core.ts";
import type { RunEvent } from "../src/lib/lab/types.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
async function main() {
  const corpus = prepareCorpus();
  const config = readConfig();
  const provider = new GooglePineconeProvider(config, corpus);
  await provider.verifyModels(AbortSignal.timeout(20000));
  await provider.describeIndex(AbortSignal.timeout(20000));
  console.log("Models and index dimensions verified. Preparing isolated namespace", namespaceFor(corpus, config));
  const vectors = [];
  for (const chunk of process.argv.includes("--capture-only") ? [] : corpus.chunks) {
    const values = await provider.embed(chunk.text, AbortSignal.timeout(20000), "RETRIEVAL_DOCUMENT");
    vectors.push({ id: chunk.id, values, metadata: { documentId: chunk.documentId, corpusVersion: corpus.version } });
  }
  if (vectors.length) await provider.pinecone("vectors/upsert", { namespace: namespaceFor(corpus, config), vectors }, AbortSignal.timeout(20000));
  // Pinecone writes are eventually consistent. Wait for this dedicated corpus only.
  let ready = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    const stats = await (await provider.pinecone("describe_index_stats", {}, AbortSignal.timeout(10000))).json();
    if (stats.namespaces?.[namespaceFor(corpus, config)]?.vectorCount === corpus.chunks.length) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!ready) throw new Error("Index is not ready yet; rerun setup after Pinecone finishes indexing.");
  console.log("Index ready:", corpus.chunks.length, "passages. Capturing a real run.");
  const events: RunEvent[] = [];
  for await (const event of executeRun({ question: "Why did the sample incident create two jobs for one event, and what fixed it?", documentIds: corpus.documents.map(d => d.id).sort(), topK: 4 }, corpus, provider, AbortSignal.timeout(45000))) events.push(event);
  const run = replayRun(events);
  if (run?.status !== "complete" || !run.citations.length) throw new Error(run?.error || "Capture did not produce a completed, cited answer. No recorded replay was written.");
  fs.mkdirSync(path.join(root, "src/data/lab"), { recursive: true });
  fs.writeFileSync(path.join(root, "src/data/lab/corpus.json"), JSON.stringify(corpus, null, 2) + "\n");
  fs.writeFileSync(path.join(root, "src/data/lab/recorded-run.json"), JSON.stringify({ provenance: "Captured from a real Google embedding, Pinecone retrieval, and streamed Google generation run by lab:setup.", run }, null, 2) + "\n");
  console.log("Recorded run saved:", run.id, run.generationModel, run.totalDurationMs, "ms;", run.citations.length, "citations.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Setup failed."); process.exitCode = 1; });
