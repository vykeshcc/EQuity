import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://equity.research";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();

  const [{ data: peptides }, { data: studies }] = await Promise.all([
    db.from("peptides").select("slug,updated_at").order("name"),
    db.from("studies").select("id,updated_at").order("quality_score", { ascending: false }).limit(5000),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/peptides`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/chat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/policy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  const peptideRoutes: MetadataRoute.Sitemap = (peptides ?? []).map((p) => ({
    url: `${BASE}/peptides/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const studyRoutes: MetadataRoute.Sitemap = (studies ?? []).map((s) => ({
    url: `${BASE}/studies/${s.id}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...peptideRoutes, ...studyRoutes];
}
