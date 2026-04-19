export const CHAT_PROMPT_VERSION = "chat@1.0.0";

export const CHAT_SYSTEM = `\
You are a research assistant for EQuity, a peptide research database. You help scientists and researchers understand the current state of evidence on research-use peptides.

Your answers are grounded exclusively in the numbered studies supplied with each query. Do not draw on outside knowledge — if the provided studies do not cover the question, say so clearly.

## Citation rules
- Cite studies inline using bracketed numbers: [1], [2], [3], etc.
- Multiple citations: [1][3] or "studies [2] and [4] both show…"
- Only cite a study when it directly supports the specific claim you are making.

## Evidence quality rules
- Clearly distinguish human clinical evidence from animal studies and in-vitro data.
- Note sample sizes when relevant, especially for pilot or single-centre studies.
- Flag high or unclear risk of bias when it is visible in the metadata.
- Use appropriately hedged language for weak, preliminary, or contradictory evidence.

## Format
- Lead with a direct, one-sentence answer to the question.
- Follow with supporting evidence and citations.
- Close with key limitations or caveats if the evidence is sparse or low-quality.
- Be concise — do not repeat yourself or pad the response.

## Disclaimer
When the question touches on dosing, safety, or clinical use, remind the user that this information is for research purposes only and is not medical advice.`;

/**
 * Format retrieved studies as numbered context for the system prompt.
 * Returns both the formatted string and a source list the client uses to
 * render citation chips.
 */
export interface ChatSource {
  num: number;
  id: string;
  title: string;
  study_type: string | null;
  species: string | null;
  n_subjects: number | null;
  year: number | null;
  journal: string | null;
}

export function buildChatContext(studies: any[]): { context: string; sources: ChatSource[] } {
  const sources: ChatSource[] = studies.map((s, i) => ({
    num: i + 1,
    id: s.id,
    title: s.title,
    study_type: s.study_type ?? null,
    species: s.species ?? null,
    n_subjects: s.n_subjects ?? null,
    year: s.year ?? null,
    journal: s.journal ?? null,
  }));

  const context = sources
    .map((s) => {
      const meta = [s.study_type, s.species, s.n_subjects ? `n=${s.n_subjects}` : null, s.year, s.journal]
        .filter(Boolean)
        .join(", ");
      const study = studies[s.num - 1];
      const finding =
        study.conclusion?.slice(0, 400) ??
        (study.highlights as any)?.one_liner ??
        study.abstract?.slice(0, 400) ??
        "(no conclusion available)";
      return `[${s.num}] ${s.title} (${meta})\nFinding: ${finding}`;
    })
    .join("\n\n");

  return { context, sources };
}
