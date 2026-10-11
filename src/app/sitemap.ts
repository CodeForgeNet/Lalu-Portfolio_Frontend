import type { MetadataRoute } from "next";
import { profile, studies } from "@/data/portfolio";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/projects",
    "/about",
    "/lab",
    "/lab/documents",
    "/lab/reliability",
    "/lab/resume-match",
    ...studies.map((study) => `/projects/${study.slug}`),
  ].map((path) => ({ url: `${profile.url}${path}` }));
}
