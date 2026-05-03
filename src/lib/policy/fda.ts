import type { SupabaseClient } from "@supabase/supabase-js";
import { embed, toPgVector } from "@/lib/embeddings/embed";
import { hashString } from "@/lib/utils/cn";

/**
 * FDA policy ingestion via openFDA API (no API key needed, 240 req/min).
 * Queries drug enforcement actions for tracked peptides by name/alias.
 */

const OPENFDA_BASE = "https://api.fda.gov/drug/enforcement.json";

interface EnforcementResult {
  recall_number: string;
  product_description: string;
  reason_for_recall: string;
  recalling_firm: string;
  classification: string; // "Class I" | "Class II" | "Class III"
  status: string;         // "Ongoing" | "Terminated" | "Completed"
  report_date: string;    // "YYYYMMDD"
  recall_initiation_date: string;
  distribution_pattern: string;
}

function classifyStatus(classification: string): string {
  if (classification === "Class I") return "banned";
  if (classification === "Class II") return "restricted";
  return "under-review";
}

function parseOpenFdaDate(d: string): string | null {
  if (!d || d.length < 8) return null;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

async function queryEnforcement(searchTerm: string, limit = 10): Promise<EnforcementResult[]> {
  const q = encodeURIComponent(`product_description:"${searchTerm}"`);
  const url = `${OPENFDA_BASE}?search=${q}&limit=${limit}&sort=report_date:desc`;
  const r = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (r.status === 404) return []; // no results
  if (!r.ok) throw new Error(`openFDA ${r.status}`);
  const j = await r.json();
  return j.results ?? [];
}

export async function ingestFdaPolicy(db: SupabaseClient): Promise<{ checked: number; added: number; errors: string[] }> {
  const result = { checked: 0, added: 0, errors: [] as string[] };

  const { data: peptides } = await db.from("peptides").select("id,slug,name,aliases");

  // Build search terms: peptide names + important aliases
  const searchTerms: Array<{ term: string; peptideId: string | null; peptideSlug: string | null }> = [];
  for (const p of peptides ?? []) {
    searchTerms.push({ term: p.name, peptideId: p.id, peptideSlug: p.slug });
    for (const alias of (p.aliases ?? []).slice(0, 2)) {
      if (alias && alias.length > 3) {
        searchTerms.push({ term: alias, peptideId: p.id, peptideSlug: p.slug });
      }
    }
  }
  // Add general compounding/peptide terms not tied to a specific peptide
  searchTerms.push({ term: "compounding peptide", peptideId: null, peptideSlug: null });

  const seenRecallNums = new Set<string>();

  for (const { term, peptideId } of searchTerms) {
    try {
      const items = await queryEnforcement(term, 10);
      for (const item of items) {
        result.checked++;
        if (seenRecallNums.has(item.recall_number)) continue;
        seenRecallNums.add(item.recall_number);

        const hash = hashString(item.recall_number);
        const { data: existing } = await db
          .from("policy_items")
          .select("id")
          .eq("source_hash", hash)
          .maybeSingle();
        if (existing) continue;

        const summary = `${item.reason_for_recall} — ${item.recalling_firm}. ${item.distribution_pattern ?? ""}`.slice(0, 400).trim();
        const sourceUrl = `https://www.accessdata.fda.gov/scripts/ires/index.cfm?recall_number=${item.recall_number}`;

        let embeddingVal: string | null = null;
        try {
          const [vec] = await embed([`${item.product_description}\n\n${summary}`]);
          embeddingVal = toPgVector(vec);
        } catch {
          // Embedding is optional
        }

        await db.from("policy_items").insert({
          jurisdiction: "FDA",
          status: classifyStatus(item.classification),
          peptide_id: peptideId,
          title: item.product_description.slice(0, 200),
          summary,
          effective_date: parseOpenFdaDate(item.report_date),
          source_url: sourceUrl,
          source_hash: hash,
          embedding: embeddingVal,
        });
        result.added++;
      }
    } catch (err: any) {
      result.errors.push(`${term}: ${err.message}`);
    }
  }

  return result;
}
