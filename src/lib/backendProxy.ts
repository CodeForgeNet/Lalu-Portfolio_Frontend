import "server-only";
import { randomUUID } from "node:crypto";
import type { Corpus } from "@/lib/lab/types";
import type { ReliabilityScenario } from "@/lib/reliability";

const MAX_BODY_BYTES = 12_000;

function config() {
  const base = process.env.BACKEND_API_BASE;
  const secret = process.env.BACKEND_API_SECRET_KEY;
  if (!base || !secret) throw new Error("Backend proxy is not configured.");
  return { base: base.replace(/\/$/, ""), secret };
}

function clientIp(request: Request): string {
  return request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim()
    || request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || "unknown";
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function backendFetch(path: string, init: RequestInit = {}, ip = "server-render"): Promise<Response> {
  const { base, secret } = config();
  return fetch(`${base}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "x-api-key": secret,
      "x-request-id": randomUUID(),
      "x-client-ip": ip,
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
  });
}

export async function proxyToBackend(request: Request, path: string): Promise<Response> {
  if (request.method !== "GET" && !sameOrigin(request)) return Response.json({ error: "Use this endpoint from the portfolio site." }, { status: 403 });
  try {
    let body: string | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.text();
      if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return Response.json({ error: "Request is too large." }, { status: 413 });
    }
    const upstream = await backendFetch(path, { method: request.method, body, signal: request.signal }, clientIp(request));
    const headers = new Headers();
    for (const name of ["content-type", "cache-control", "x-request-id", "ratelimit-limit", "ratelimit-remaining", "ratelimit-reset"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (upstream.headers.get("content-type")?.includes("text/event-stream")) {
      headers.set("Cache-Control", "no-cache, no-transform");
      headers.set("X-Accel-Buffering", "no");
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    const status = error instanceof Error && error.message === "Backend proxy is not configured." ? 503 : 502;
    return Response.json({ error: status === 503 ? "The AI backend is not configured." : "The AI backend is unavailable." }, { status });
  }
}

export async function getBackendCorpus(): Promise<Corpus> {
  const response = await backendFetch("/api/lab/documents", { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("The document collection is unavailable.");
  const value = await response.json() as Corpus;
  if (!value || typeof value.version !== "string" || !Array.isArray(value.documents) || !Array.isArray(value.chunks)) throw new Error("The backend returned an invalid document collection.");
  return value;
}

export async function getReliabilityScenarios(): Promise<ReliabilityScenario[]> {
  const response = await backendFetch("/api/lab/reliability/scenarios", { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("The reliability catalog is unavailable.");
  const value = await response.json() as { scenarios?: ReliabilityScenario[] };
  if (!value || !Array.isArray(value.scenarios)) throw new Error("The backend returned an invalid reliability catalog.");
  return value.scenarios;
}
