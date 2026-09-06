import "server-only";
import corpusData from "@/data/lab/corpus.json";
import type { Corpus } from "./types.ts";
export const corpus = corpusData as Corpus;
export { GooglePineconeProvider, readConfig } from "./providers.ts";
export { executeRun } from "./pipeline.ts";
