import test from "node:test";
import assert from "node:assert/strict";
import { GooglePineconeProvider, namespaceFor } from "../../src/lib/lab/providers.ts";
import { prepareCorpus } from "../../scripts/lab-corpus.ts";

const corpus = prepareCorpus();
const config = { googleKey: "test-google", pineconeKey: "test-pinecone", index: "test", embeddingModel: "gemini-embedding-001", generationModel: "test-model", dimensions: 3 };

test("Pinecone queries carry the active namespace, selected document filter, version and topK", async () => {
  const original = globalThis.fetch;
  const requests: { url: string; body: Record<string, unknown> }[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    requests.push({ url, body });
    if (url.includes("api.pinecone.io/indexes")) return Response.json({ host: "test.svc.pinecone.io", dimension: 3, metric: "cosine" });
    if (url.endsWith("describe_index_stats")) return Response.json({ namespaces: { [namespaceFor(corpus, config)]: { vectorCount: corpus.chunks.length } } });
    return Response.json({ matches: [] });
  };
  try {
    const provider = new GooglePineconeProvider(config, corpus);
    await provider.retrieve([1, 0, 0], { question: "q", documentIds: ["portfolio-cache"], topK: 2 }, new AbortController().signal);
    const query = requests.find(r => r.url.endsWith("/query"))!.body;
    assert.equal(query.namespace, namespaceFor(corpus, config));
    assert.deepEqual(query.filter, { documentId: { $in: ["portfolio-cache"] }, corpusVersion: { $eq: corpus.version } });
    assert.equal(query.topK, 2);
  } finally { globalThis.fetch = original; }
});

test("generation uses only the given evidence, reports usage, and requires a terminal finish reason", async () => {
  const original = globalThis.fetch;
  let sent: Record<string, unknown> = {};
  globalThis.fetch = async (_input, init) => {
    sent = JSON.parse(String(init?.body));
    return new Response('data: {"candidates":[{"content":{"parts":[{"text":"Known fact [S1]"}]},"finishReason":"STOP"}],"modelVersion":"actual-model","usageMetadata":{"promptTokenCount":9,"candidatesTokenCount":4}}\n\n');
  };
  try {
    const provider = new GooglePineconeProvider(config, corpus);
    const parts = await Array.fromAsync(provider.generate("Q", "[S1] ONLY_THIS_EVIDENCE", new AbortController().signal));
    assert.ok(JSON.stringify(sent.contents).includes("ONLY_THIS_EVIDENCE"));
    assert.ok(!JSON.stringify(sent.contents).includes("Resume Summary"));
    assert.equal(parts[0].model, "actual-model");
    assert.equal(parts[0].usage?.inputTokens, 9);
    globalThis.fetch = async () => new Response('data: {"candidates":[{"content":{"parts":[{"text":"Partial"}]}}]}\n\n');
    await assert.rejects(Array.fromAsync(provider.generate("Q", "Evidence", new AbortController().signal)), /disconnected/);
  } finally { globalThis.fetch = original; }
});
