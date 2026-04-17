import { SCHEMA_JSON_STRING } from "@/lib/extraction/schema";

export const EXTRACT_PROMPT_VERSION = "extract@1.0.0";

/**
 * System prompt for peptide-study extraction.
 * Split into cached + uncached blocks so the schema/instructions are paid for once per cache window.
 */

export const EXTRACT_SYSTEM_STATIC = `You are a rigorous research-literature extraction system for peptide science.

Your job: given the title, abstract, and (optionally) full text of a study, normalize it into a strict JSON object matching the schema below. You output JSON ONLY — no prose, no markdown fences.

Schema (keys and allowed value shapes):
${SCHEMA_JSON_STRING}

Rules:
1. Use ONLY information present in the provided text. If a field is not reported, set it to null (or empty array / "unclear") AND list it in \`missing_fields\`. Do NOT infer beyond the text.
2. \`study_type\`: pick the single best match from the enum. If it's a randomized controlled trial in humans, "RCT". If it's exclusively in cell culture, "in-vitro". If it's in live animals, "animal". If it's both, pick the primary experiment.
3. \`species\`: the organism actually treated/tested. For reviews/meta-analyses, use the dominant species covered (or "other").
4. \`n_subjects\`: total number of experimental subjects (humans, animals) actually treated or analyzed. For in-vitro, leave null.
5. \`peptides\`: list every peptide studied using the name as it appears in the text. Include aliases if the text uses them.
6. \`dose\`: one entry per peptide/dosing-arm. Convert to mg where unambiguous (e.g. 500 µg → 0.5). Otherwise fill \`amount_raw\` verbatim.
7. \`primary_outcomes\` / \`secondary_outcomes\`: copy the outcome names as stated. Mark \`direction\` based on whether the peptide arm improved, worsened, or showed no change vs control. Capture effect sizes, p-values, and CIs verbatim where available.
8. \`highlights.tldr\`: exactly three bullets — [finding, effect magnitude or direction, important caveat]. Each ≤ 20 words. Be specific; avoid marketing language.
9. \`risk_of_bias\`: apply Cochrane RoB-style judgments conservatively. For non-clinical studies use "unclear" for domains that don't apply.
10. \`confidence\`: your confidence that another careful extractor would produce the same JSON. Lower it when the text is ambiguous, truncated, or non-English.
11. Dates/years: use the publication year; if only a preprint date is given, use that.
12. NEVER hallucinate authors, journals, DOIs, or numbers. If uncertain → null + missing_fields entry.

Output a single JSON object. No commentary, no fences.`;

/** Builds the user-message text for a specific document. */
export function buildExtractUserMessage(input: {
  source: string;
  source_id: string;
  title?: string | null;
  abstract?: string | null;
  full_text?: string | null;
  journal?: string | null;
  year?: number | null;
  authors?: string[];
  doi?: string | null;
}): string {
  const parts: string[] = [];
  parts.push(`SOURCE: ${input.source} / ${input.source_id}`);
  if (input.doi) parts.push(`DOI: ${input.doi}`);
  if (input.journal) parts.push(`JOURNAL: ${input.journal}`);
  if (input.year) parts.push(`YEAR: ${input.year}`);
  if (input.authors?.length) parts.push(`AUTHORS: ${input.authors.join(", ")}`);
  if (input.title) parts.push(`TITLE: ${input.title}`);
  if (input.abstract) parts.push(`\nABSTRACT:\n${input.abstract}`);
  if (input.full_text) {
    // Guard against runaway inputs; the extractor truncates before sending.
    parts.push(`\nFULL TEXT:\n${input.full_text.slice(0, 60_000)}`);
  }
  parts.push("\nReturn the JSON now.");
  return parts.join("\n");
}
