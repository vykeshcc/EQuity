import type { SupabaseClient } from "@supabase/supabase-js";
import { extractStudy } from "@/lib/extraction/extract";
import { persistStudy } from "@/lib/extraction/persist";
import { SCHEMA_VERSION } from "@/lib/extraction/schema";
import { EXTRACT_PROMPT_VERSION } from "@/lib/prompts/extract.v1";

/**
 * Scheduled re-extraction: picks studies whose extraction_version lags the current
 * prompt/schema combo and re-runs them with the latest model. Soft-versions the result
 * by inserting a new row (the unique constraint is on source+source_id+extraction_version).
 */
export async function reextractBatch(
  db: SupabaseClient,
  opts: { batchSize?: number } = {},
): Promise<{ processed: number; updated: number; errors: string[] }> {
  const currentVersion = `${EXTRACT_PROMPT_VERSION}+${SCHEMA_VERSION}`;
  const batchSize = opts.batchSize ?? 25;
  const result = { processed: 0, updated: 0, errors: [] as string[] };

  const { data: stale } = await db
    .from("studies")
    .select("id,source,source_id,raw_document_id,title,pdf_url,source_url")
    .neq("extraction_version", currentVersion)
    .is("superseded_by", null)
    .order("extracted_at", { ascending: true })
    .limit(batchSize);

  for (const s of stale ?? []) {
    try {
      const { data: raw } = await db
        .from("raw_documents")
        .select("title,abstract,full_text,doi,payload")
        .eq("id", s.raw_document_id)
        .maybeSingle();
      if (!raw) {
        result.errors.push(`${s.id}: no raw_document`);
        continue;
      }

      const extraction = await extractStudy({
        source: s.source as any,
        source_id: s.source_id,
        title: raw.title ?? s.title,
        abstract: raw.abstract ?? null,
        full_text: raw.full_text ?? null,
        doi: raw.doi ?? null,
      });

      const newId = await persistStudy({
        db,
        raw_document_id: s.raw_document_id,
        source: s.source,
        source_id: s.source_id,
        extraction,
        source_url: s.source_url,
        pdf_url: s.pdf_url,
      });

      if (newId !== s.id) {
        await db.from("studies").update({ superseded_by: newId }).eq("id", s.id);
      }
      result.updated++;
    } catch (err: any) {
      result.errors.push(`${s.id}: ${err.message}`);
    }
    result.processed++;
  }
  return result;
}
