import { proxyToBackend } from "@/lib/backendProxy";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/lab/runs");
}
