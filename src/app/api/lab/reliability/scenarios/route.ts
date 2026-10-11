import { proxyToBackend } from "@/lib/backendProxy";

export const runtime = "nodejs";
export async function GET(request: Request) {
  return proxyToBackend(request, "/api/lab/reliability/scenarios");
}
