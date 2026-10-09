import { proxyToBackend } from "@/lib/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, "/api/lab/documents");
}
