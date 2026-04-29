import type { SupabaseClient } from "@supabase/supabase-js";
import { extractStudy } from "@/lib/extraction/extract";
import { persistStudy } from "@/lib/extraction/persist";

/**
 * OpenAlex API ingestion for international papers.
 * 1) search for each peptide name/alias
 * 2) extract metadata and reconstruct abstract from inverted index
 * 3) extract + persist
 *
 * Idempotent: writes raw_documents on (source='openalex', source_id=WorkID).
 */

const OPENALEX_API = "https://api.openalex.org/works";

interface OpenAlexWork {
  id: string; // e.g. "https://openalex.org/W2140656363"
  doi: string | null;
  title: string | null;
  publication_year: number | null;
  primary_location?: {
    source?: {
      display_name?: string | null;
    } | null;
  } | null;
  authorships?: Array<{
    author?: {
      display_name?: string | null;
    } | null;
  }> | null;
  abstract_inverted_index?: Record<string, number[]> | null;
}

function emailParam(): string {
  const email = process.env.PUBMED_EMAIL || process.env.OPENALEX_EMAIL;
  return email ? `&mailto=${encodeURIComponent(email)}` : "";
}

function reconstructAbstract(invertedIndex: Record<string, number[]> | null | undefined): string | null {
  if (!invertedIndex) return null;
  let maxLen = 0;
  for (const positions of Object.values(invertedIndex)) {
    for (const pos of positions) {
      if (pos > maxLen) maxLen = pos;
    }
  }
  const words = new Array(maxLen + 1).fill("");
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words[pos] = word;
    }
  }
  return words.join(" ").trim() || null;
}

function buildQuery(peptide: { name: string; aliases: string[] }): string {
  const terms = [peptide.name, ...peptide.aliases].map((t) => `"${t}"`);
  return terms.join(" OR ");
}

export interface OpenAlexIngestResult {
  peptide: string;
  fetched: number;
  newStudies: number;
  errors: string[];
}

export async function ingestOpenAlexForPeptide(
  db: SupabaseClient,
  peptide: { id: string; name: string; aliases: string[] },
  opts: { limit?: number; sinceDays?: number } = {},
): Promise<OpenAlexIngestResult> {
  const result: OpenAlexIngestResult = { peptide: peptide.name, fetched: 0, newStudies: 0, errors: [] };
  const limit = opts.limit ?? 25;

  let filter = "";
  if (opts.sinceDays) {
    const d = new Date(Date.now() - opts.sinceDays * 86_400_000);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    filter = `&filter=from_publication_date:${dateStr}`;
  }

  const query = buildQuery(peptide);
  // Search in title and abstract to ensure high relevance
  const url = `${OPENALEX_API}?search=${encodeURIComponent(query)}${filter}&per-page=${limit}&sort=publication_year:desc${emailParam()}`;

  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`OpenAlex fetch failed ${r.status}`);
  const json = await r.json();
  const works: OpenAlexWork[] = json.results ?? [];

  if (works.length === 0) return result;

  // Filter out works we already have
  const workIds = works.map((w) => w.id);
  const { data: existing } = await db
    .from("raw_documents")
    .select("source_id")
    .eq("source", "openalex")
    .in("source_id", workIds);
    
  const have = new Set((existing ?? []).map((row) => row.source_id));
  const todo = works.filter((w) => !have.has(w.id));
  
  if (todo.length === 0) return result;

  for (const art of todo) {
    try {
      const abstract = reconstructAbstract(art.abstract_inverted_index);
      const title = art.title || "Untitled Document";
      const authors = art.authorships?.map((a) => a.author?.display_name || "").filter(Boolean) || [];
      const journal = art.primary_location?.source?.display_name || null;
      
      const { data: raw } = await db
        .from("raw_documents")
        .upsert(
          {
            source: "openalex",
            source_id: art.id,
            doi: art.doi,
            title: title,
            abstract: abstract,
            payload: art as unknown as Record<string, unknown>,
          },
          { onConflict: "source,source_id" },
        )
        .select("id")
        .single();

      if (!abstract) {
        result.errors.push(`${art.id}: no abstract`);
        continue;
      }

      const extraction = await extractStudy({
        source: "openalex",
        source_id: art.id,
        title: title,
        abstract: abstract,
        journal: journal,
        year: art.publication_year,
        authors: authors,
        doi: art.doi,
      });

      await persistStudy({
        db,
        raw_document_id: raw?.id ?? null,
        source: "openalex",
        source_id: art.id,
        extraction,
        source_url: art.id, // OpenAlex uses the URL as the ID (e.g. https://openalex.org/W...)
      });
      result.newStudies++;
    } catch (err: any) {
      result.errors.push(`${art.id}: ${err.message}`);
    }
    result.fetched++;
  }
  return result;
}
