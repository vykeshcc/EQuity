/* eslint-disable no-console */
/**
 * Extracts raw_documents that never produced a study (e.g. failed on a bad model).
 * Safe to re-run — skips raw_docs that already have a linked study.
 *
 *   npm run extract:pending             # up to 100 per run (default)
 *   npm run extract:pending -- --max 50 # smaller batch
 *
 * Cost (Gemini 1.5 Flash): ~$0.0003 per study → 100 studies ≈ $0.03
 * Rate limit (free tier): 15 RPM / 1500 per day. Script auto-paces.
 */
import { getAdminDb } from "../src/lib/db/client";
import { extractStudy } from "../src/lib/extraction/extract";
import { persistStudy } from "../src/lib/extraction/persist";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const MAX_PER_RUN = Number(arg("max") ?? "100");
// Gemini 1.5 Flash free tier: 15 RPM. Each call takes ~2-4s so we add a small buffer.
const RATE_DELAY_MS = 2000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const db = getAdminDb();

  // Find raw_documents that have no linked study.
  const { data: rawDocs, error } = await db
    .from("raw_documents")
    .select("id,source,source_id,title,abstract,full_text,doi,payload")
    .not(
      "id",
      "in",
      // subquery: all raw_document_ids that already have a study
      `(select raw_document_id from studies where raw_document_id is not null)`,
    )
    .not("abstract", "is", null) // skip docs with no abstract
    .order("fetched_at", { ascending: true })
    .limit(MAX_PER_RUN);

  if (error) {
    // Supabase doesn't support subqueries in .not() — fall back to two-step query.
    const { data: existingIds } = await db.from("studies").select("raw_document_id").not("raw_document_id", "is", null);
    const have = new Set((existingIds ?? []).map((r: any) => r.raw_document_id));

    const { data: allRaw } = await db
      .from("raw_documents")
      .select("id,source,source_id,title,abstract,full_text,doi,payload")
      .not("abstract", "is", null)
      .order("fetched_at", { ascending: true })
      .limit(MAX_PER_RUN * 3);

    const pending = (allRaw ?? []).filter((r: any) => !have.has(r.id)).slice(0, MAX_PER_RUN);
    return runExtraction(db, pending);
  }

  return runExtraction(db, rawDocs ?? []);
}

async function runExtraction(db: any, docs: any[]) {
  console.log(`Found ${docs.length} unextracted raw documents (max ${MAX_PER_RUN} per run).`);
  if (!docs.length) {
    console.log("Nothing to do.");
    return;
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let i = 0; i < docs.length; i++) {
    const raw = docs[i];
    const label = `[${i + 1}/${docs.length}] ${raw.source}:${raw.source_id}`;

    if (!raw.abstract) {
      console.log(`  skip  ${label} — no abstract`);
      skipped++;
      continue;
    }

    const t0 = Date.now();
    try {
      const payload: any = raw.payload ?? {};
      const extraction = await extractStudy({
        source: raw.source,
        source_id: raw.source_id,
        title: raw.title ?? payload.title,
        abstract: raw.abstract ?? payload.abstract,
        full_text: raw.full_text ?? null,
        journal: payload.journal ?? null,
        year: payload.year ?? null,
        authors: payload.authors ?? [],
        doi: raw.doi ?? payload.doi ?? null,
      });

      await persistStudy({
        db,
        raw_document_id: raw.id,
        source: raw.source,
        source_id: raw.source_id,
        extraction,
        source_url:
          raw.source === "pubmed"
            ? `https://pubmed.ncbi.nlm.nih.gov/${raw.source_id}/`
            : payload.source_url ?? null,
      });

      totalInputTokens += extraction.usage.inputTokens;
      totalOutputTokens += extraction.usage.outputTokens;
      const ms = Date.now() - t0;
      const score = (extraction.data as any).quality_score ?? "?";
      console.log(`  ✓  ${label} | score=${score} | ${ms}ms`);
      ok++;
    } catch (err: any) {
      console.log(`  ✗  ${label}\n     ${err.message}`);
      failed++;
    }

    // Pace to stay under 15 RPM on free tier.
    if (i < docs.length - 1) await sleep(RATE_DELAY_MS);
  }

  // Cost estimate (Gemini 1.5 Flash pricing).
  const costUsd = totalInputTokens / 1_000_000 * 0.075 + totalOutputTokens / 1_000_000 * 0.30;

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Extracted : ${ok}
 Skipped   : ${skipped} (no abstract)
 Failed    : ${failed}
 Tokens    : ${totalInputTokens.toLocaleString()} in / ${totalOutputTokens.toLocaleString()} out
 Est. cost : $${costUsd.toFixed(4)} USD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
