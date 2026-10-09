import { proxyToBackend } from "@/lib/backendProxy";

export const runtime = "nodejs";
export const POST = (request: Request) => proxyToBackend(request, "/api/suggest");
