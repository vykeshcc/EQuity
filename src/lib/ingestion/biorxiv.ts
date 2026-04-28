import type { SupabaseClient } from "@supabase/supabase-js";
import { extractStudy } from "@/lib/extraction/extract";
import { persistStudy } from "@/lib/extraction/persist";

/**
 * bioRxiv/medRxiv ingestion via the public "details" API.
 * We do a recency pull + a keyword filter on title/abstract (the API doesn't have full text search).
 */

async function recent(server: "biorxiv" | "medrxiv", daysBack = 90): Promise<any[]> {
  const to = new Date();
  const from = new Date(Date.now() - daysBack * 86_400_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url = `https://api.biorxiv.org/details/${server}/${fmt(from)}/${fmt(to)}/0`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${server} ${r.status}`);
  const j = await r.json();
  return j.collection ?? [];
}

function matches(entry: any, peptide: { name: string; aliases: string[] }): boolean {
  const needles = [peptide.name, ...peptide.aliases].map((s) => s.toLowerCase());
  const hay = `${entry.title ?? ""} ${entry.abstract ?? ""}`.toLowerCase();
  return needles.some((n) => n && hay.includes(n));
}

export interface BiorxivIngestResult {
  server: "biorxiv" | "medrxiv";
  peptide: string;
  fetched: number;
  newStudies: number;
  errors: string[];
}

export async function ingestBiorxivForPeptide(
  db: SupabaseClient,
  peptide: { id: string; name: string; aliases: string[] },
  opts: { server?: "biorxiv" | "medrxiv"; daysBack?: number } = {},
): Promise<BiorxivIngestResult> {
  const server = opts.server ?? "biorxiv";
  const res: BiorxivIngestResult = { server, peptide: peptide.name, fetched: 0, newStudies: 0, errors: [] };
  const entries = (await recent(server, opts.daysBack ?? 90)).filter((e) => matches(e, peptide));

  for (const e of entries) {
    try {
      const doi = e.doi;
      const year = Number((e.date ?? "").slice(0, 4)) || null;
      const { data: raw } = await db
        .from("raw_documents")
        .upsert(
          {
            source: server,
            source_id: doi,
            doi,
            title: e.title,
            abstract: e.abstract,
            payload: e,
          },
          { onConflict: "source,source_id" },
        )
        .select("id")
        .single();

      if (!e.abstract) {
        res.errors.push(`${doi}: no abstract`);
        continue;
      }

      const extraction = await extractStudy({
        source: server,
        source_id: doi,
        title: e.title,
        abstract: e.abstract,
        journal: server,
        year,
        authors: (e.authors ?? "").split(";").map((s: string) => s.trim()).filter(Boolean),
        doi,
      });

      await persistStudy({
        db,
        raw_document_id: raw?.id ?? null,
        source: server,
        source_id: doi,
        extraction,
        source_url: `https://doi.org/${doi}`,
      });
      res.newStudies++;
    } catch (err: any) {
      res.errors.push(`${e.doi}: ${err.message}`);
    }
    res.fetched++;
  }
  return res;
}
