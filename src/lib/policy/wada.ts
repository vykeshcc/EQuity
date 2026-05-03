import type { SupabaseClient } from "@supabase/supabase-js";
import { embed, toPgVector } from "@/lib/embeddings/embed";
import { hashString } from "@/lib/utils/cn";

/**
 * WADA Prohibited List tracker.
 * Strategy: fetch the current year's prohibited-list HTML, hash it; if changed vs last
 * recorded hash, emit an update event per tracked peptide that appears in the list body.
 *
 * This is intentionally simple — WADA publishes one list per year. Deeper diffing can
 * be added later.
 */

const WADA_LIST = "https://www.wada-ama.org/en/prohibited-list";

export async function ingestWadaPolicy(db: SupabaseClient): Promise<{ checked: number; added: number; errors: string[] }> {
  const result = { checked: 1, added: 0, errors: [] as string[] };
  try {
    const r = await fetch(WADA_LIST);
    if (!r.ok) throw new Error(`WADA ${r.status}`);
    const html = (await r.text()).toLowerCase();
    const hash = hashString(html);

    const { data: peptides } = await db.from("peptides").select("id,slug,name,aliases");
    const year = new Date().getFullYear();

    for (const p of peptides ?? []) {
      const needles = [p.name, ...(p.aliases ?? [])].map((s: string) => s.toLowerCase());
      const found = needles.some((n: string) => n && html.includes(n));
      if (!found) continue;

      const itemHash = hashString(`${hash}:${p.slug}:${year}`);
      const { data: existing } = await db
        .from("policy_items")
        .select("id")
        .eq("source_hash", itemHash)
        .maybeSingle();
      if (existing) continue;

      const summary = `${p.name} appears on the WADA ${year} Prohibited List (or its explanatory guidance).`;

      let embeddingVal: string | null = null;
      try {
        const [vec] = await embed([summary]);
        embeddingVal = toPgVector(vec);
      } catch {
        // Embedding is optional
      }

      await db.from("policy_items").insert({
        jurisdiction: "WADA",
        status: "banned",
        peptide_id: p.id,
        title: `WADA ${year} Prohibited List — ${p.name}`,
        summary,
        effective_date: `${year}-01-01`,
        source_url: WADA_LIST,
        source_hash: itemHash,
        embedding: embeddingVal,
      });
      result.added++;
    }
  } catch (err: any) {
    result.errors.push(err.message);
  }
  return result;
}
