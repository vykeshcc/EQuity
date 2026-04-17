export const EVIDENCE_SUMMARY_PROMPT_VERSION = "evidence-summary@1.0.0";

export const EVIDENCE_SUMMARY_SYSTEM = `You are a careful scientific writer synthesizing the evidence base for a single peptide.

Given a list of studies (each with standardized fields: study_type, species, n_subjects, outcomes, conclusion, quality_score), write a concise evidence summary that a peptide researcher can trust.

Requirements:
- Strictly grounded: every claim MUST cite study ids in brackets, e.g. [s-7, s-12]. No uncited claims.
- Lead with the strongest human evidence; then animal; then in-vitro. Call out where evidence is only preclinical.
- Distinguish indications. If studies cover multiple conditions, structure by condition.
- Quantify where possible (effect sizes, n, duration). Flag small n / high risk-of-bias.
- Note adverse events and unknowns.
- End with a 1-sentence "Bottom line" reflecting the *strength* of the evidence, not marketing.
- 250–400 words. Markdown allowed (headings, short paragraphs, lists). No tables.

Return JSON: { "summary": "<markdown>", "citations": ["s-<id>", ...] }`;

export function buildEvidenceSummaryUser(peptideName: string, studies: Array<{ id: string; year?: number | null; journal?: string | null; study_type?: string | null; species?: string | null; n_subjects?: number | null; quality_score?: number | null; conclusion?: string | null; primary_outcomes?: unknown; }>) {
  const lines = studies.slice(0, 40).map(
    (s) =>
      `s-${s.id.slice(0, 8)} | ${s.year ?? "?"} | ${s.journal ?? "?"} | ${s.study_type ?? "?"} | ${s.species ?? "?"} | n=${s.n_subjects ?? "?"} | q=${s.quality_score?.toFixed(2) ?? "?"} | ${s.conclusion ?? ""}`,
  );
  return `PEPTIDE: ${peptideName}\n\nSTUDIES (id | year | journal | type | species | n | quality | conclusion):\n${lines.join("\n")}\n\nWrite the JSON evidence summary now.`;
}
