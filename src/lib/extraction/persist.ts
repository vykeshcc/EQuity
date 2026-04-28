import type { SupabaseClient } from "@supabase/supabase-js";
import { embed, toPgVector } from "@/lib/embeddings/embed";
import { scoreStudy } from "@/lib/ranking/score";
import type { ExtractOutput } from "@/lib/extraction/extract";

interface PersistInput {
  db: SupabaseClient;
  raw_document_id: string | null;
  source: string;
  source_id: string;
  extraction: ExtractOutput;
  pdf_url?: string | null;
  source_url?: string | null;
}

/**
 * Persist an extraction into `studies` + join tables.
 * Idempotent on (source, source_id, extraction_version): conflicting rows are upserted.
 */
export async function persistStudy({
  db,
  raw_document_id,
  source,
  source_id,
  extraction,
  pdf_url,
  source_url,
}: PersistInput): Promise<string> {
  const d = extraction.data;

  const text = [d.title, d.conclusion, ...d.highlights.tldr].filter(Boolean).join("\n\n");
  const [vec] = await embed([text]);

  const quality = scoreStudy({
    study_type: d.study_type,
    species: d.species,
    n_subjects: d.n_subjects ?? null,
    year: d.year ?? null,
    risk_of_bias: d.risk_of_bias?.overall ?? null,
  });

  const row = {
    raw_document_id,
    source,
    source_id,
    doi: d.doi ?? null,
    title: d.title,
    authors: d.authors,
    year: d.year,
    journal: d.journal ?? null,
    study_type: d.study_type,
    species: d.species,
    n_subjects: d.n_subjects ?? null,
    design: d.design ?? null,
    dose: d.dose,
    duration_days: d.duration_days ?? null,
    route: d.route ?? null,
    primary_outcomes: d.primary_outcomes,
    secondary_outcomes: d.secondary_outcomes,
    adverse_events: d.adverse_events,
    conclusion: d.conclusion,
    abstract: null,
    pdf_url: pdf_url ?? null,
    source_url: source_url ?? null,
    embedding: toPgVector(vec),
    quality_score: quality,
    risk_of_bias: d.risk_of_bias ?? null,
    highlights: d.highlights,
    extraction_version: `${extraction.promptVersion}+${extraction.schemaVersion}`,
    extraction_model: extraction.model,
    extracted_at: new Date().toISOString(),
  };

  const { data: study, error } = await db
    .from("studies")
    .upsert(row, { onConflict: "source,source_id,extraction_version" })
    .select("id")
    .single();
  if (error) throw new Error(`persistStudy upsert: ${error.message}`);

  // Resolve peptide links. Match by name or alias (case-insensitive).
  if (d.peptides.length > 0) {
    const { data: peptides } = await db.from("peptides").select("id,name,aliases");
    const byName = new Map<string, string>();
    for (const p of peptides ?? []) {
      byName.set(p.name.toLowerCase(), p.id);
      for (const a of p.aliases ?? []) byName.set(String(a).toLowerCase(), p.id);
    }
    const peptideIds = new Set<string>();
    for (const name of d.peptides) {
      const id = byName.get(name.toLowerCase().trim());
      if (id) peptideIds.add(id);
    }
    if (peptideIds.size > 0) {
      await db
        .from("study_peptides")
        .upsert(
          Array.from(peptideIds).map((peptide_id) => ({ study_id: study.id, peptide_id })),
          { onConflict: "study_id,peptide_id" },
        );
    }
  }

  // Log extraction run.
  await db.from("extraction_runs").insert({
    study_id: study.id,
    raw_document_id,
    model: extraction.model,
    prompt_version: extraction.promptVersion,
    input_hash: extraction.inputHash,
    input_tokens: extraction.usage.inputTokens,
    output_tokens: extraction.usage.outputTokens,
    cached_tokens: extraction.usage.cachedTokens,
    latency_ms: extraction.latencyMs,
    success: true,
  });

  return study.id;
}
