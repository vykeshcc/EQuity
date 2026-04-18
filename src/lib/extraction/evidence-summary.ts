import type { SupabaseClient } from "@supabase/supabase-js";
import { callGemini, parseJsonResponse } from "@/lib/gemini/client";
import { EVIDENCE_SUMMARY_PROMPT_VERSION, EVIDENCE_SUMMARY_SYSTEM, buildEvidenceSummaryUser } from "@/lib/prompts/evidence-summary.v1";

/** Regenerate the per-peptide evidence summary from the highest-quality studies. */
export async function generateEvidenceSummary(
  db: SupabaseClient,
  peptide: { id: string; name: string },
): Promise<{ id: string; summary: string } | null> {
  const { data: studies } = await db
    .from("studies")
    .select("id,year,journal,study_type,species,n_subjects,quality_score,conclusion,primary_outcomes,study_peptides!inner(peptide_id)")
    .eq("study_peptides.peptide_id", peptide.id)
    .order("quality_score", { ascending: false })
    .limit(40);

  if (!studies?.length) return null;

  const res = await callGemini({
    jsonMode: true,
    system: EVIDENCE_SUMMARY_SYSTEM,
    userMessage: buildEvidenceSummaryUser(peptide.name, studies as any),
    maxTokens: 1500,
    temperature: 0.2,
  });

  const j = parseJsonResponse<{ summary: string; citations: string[] }>(res.text);

  const { data: row } = await db
    .from("peptide_evidence_summaries")
    .insert({
      peptide_id: peptide.id,
      summary: j.summary,
      citations: j.citations ?? [],
      model: res.model,
      prompt_version: EVIDENCE_SUMMARY_PROMPT_VERSION,
    })
    .select("id")
    .single();

  return row ? { id: row.id, summary: j.summary } : null;
}
