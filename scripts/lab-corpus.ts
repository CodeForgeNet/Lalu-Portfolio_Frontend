import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { chunkDocument } from "../src/lib/lab/core.ts";
import type { Corpus, Document } from "../src/lib/lab/types.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export function prepareCorpus(): Corpus {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "content/lab/manifest.json"), "utf8")) as Omit<Document, "content">[];
  const documents = manifest.map(doc => ({ ...doc, content: fs.readFileSync(path.join(root, `content/lab/${doc.id}.md`), "utf8") }));
  const chunks = documents.flatMap(chunkDocument);
  const version = crypto.createHash("sha256").update(JSON.stringify({ documents, chunks })).digest("hex").slice(0, 16);
  return { version, documents, chunks };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const corpus = prepareCorpus();
  fs.mkdirSync(path.join(root, "src/data/lab"), { recursive: true });
  fs.writeFileSync(path.join(root, "src/data/lab/corpus.json"), JSON.stringify(corpus, null, 2) + "\n");
  console.log(`Prepared ${corpus.documents.length} documents / ${corpus.chunks.length} chunks, corpus ${corpus.version}. No network calls.`);
}
