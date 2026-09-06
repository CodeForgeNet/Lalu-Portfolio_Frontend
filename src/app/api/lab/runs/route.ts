import { corpus, executeRun, GooglePineconeProvider, readConfig } from "@/lib/lab/server";
import { validateSettings } from "@/lib/lab/core";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  // The public endpoint accepts only bounded questions and this curated corpus.
  if (Number(request.headers.get("content-length")) > 12000) return Response.json({ error: "Request is too large." }, { status: 413 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Use the workbench on this site." }, { status: 403 });
  let settings;
  try {
    const body = await request.text();
    if (body.length > 12000) return Response.json({ error: "Request is too large." }, { status: 413 });
    settings = validateSettings(JSON.parse(body), corpus);
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? "Invalid JSON request." : error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
  let provider;
  try { provider = new GooglePineconeProvider(readConfig(), corpus); }
  catch { return Response.json({ error: "Live investigation is not configured yet. Read the documents or explore the recorded run." }, { status: 503 }); }

  const cancel = new AbortController();
  const signal = AbortSignal.any([request.signal, cancel.signal, AbortSignal.timeout(45000)]);
  const iterator = executeRun(settings, corpus, provider, signal);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) { controller.close(); return; }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`));
        if (value.type === "done" || value.type === "error") console.info("lab_run", JSON.stringify({ runId: value.runId, status: value.type === "done" ? "complete" : value.status, durationMs: value.elapsedMs }));
      } catch { controller.error(new Error("Investigation stream closed.")); }
    },
    async cancel() { cancel.abort(); await iterator.return(undefined); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
}
