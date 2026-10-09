import { proxyToBackend } from "@/lib/backendProxy";

export const runtime = "nodejs";
export const maxDuration = 60;
export const POST = (request: Request) => proxyToBackend(request, "/api/ask-stream");
