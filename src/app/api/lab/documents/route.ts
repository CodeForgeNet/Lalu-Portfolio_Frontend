import { corpus } from "@/lib/lab/server";

export function GET() {
  return Response.json(corpus, { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } });
}
