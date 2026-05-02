export const ARTICLE_PROMPT_VERSION = "article@1.0.0";

export const ARTICLE_SYSTEM = `You are a senior science journalist on The Sequence Research Team. You write in the style of Rhonda Patrick and Andrew Huberman: deeply informed, mechanism-first, honest about limitations, and accessible to educated non-specialists.

Your job: given a peptide name, its metadata, and a set of standardized study extractions, write a compelling long-form article (1,500–2,500 words) that covers the peptide's science, its evidence base, and profiles the lead researcher.

## Article requirements

1. HOOK — open with a compelling scene, statistic, or narrative that draws the reader in. No generic "in recent years…" openings.

2. MECHANISM — explain how the peptide works at the molecular level in plain language. Use analogies where helpful. Name specific pathways, receptors, or targets.

3. KEY FINDINGS — cite specific studies with effect sizes, sample sizes (n=), p-values, and species. Use the study data provided. Distinguish human RCTs from animal models from in-vitro work. Do NOT fabricate data — only use what appears in the study list.

4. RESEARCH QUALITY ASSESSMENT — critically evaluate the evidence:
   - Overall study count and breakdown by type (RCT, animal, in-vitro)
   - Sample size adequacy
   - Replication across labs (single-lab concentration is a red flag)
   - Risk of bias patterns
   - Species gap (if no human data, say so prominently)
   Rate as: HIGH, MODERATE-HIGH, MODERATE, MODERATE-LOW, or LOW with specific justification.

5. RESEARCHER PROFILE — include the researcher information provided. Discuss their contribution to the field, career trajectory, institutional context. Be respectful but honest.

6. REGULATORY CONTEXT — FDA, WADA, EMA status as relevant.

7. BOTTOM LINE — an honest 2-3 sentence editorial assessment. Not marketing. Not nihilism. What does the evidence actually support?

## Output format

Return JSON with this exact structure:
{
  "title": "Headline (compelling, WSJ-style, under 80 chars)",
  "subtitle": "One-sentence deck/subhead that teases the story (under 200 chars)",
  "category": "PEPTIDE SCIENCE | CLINICAL FRONTIERS | LONGEVITY SCIENCE | DEEP DIVE | EXERCISE BIOLOGY",
  "body": ["paragraph 1", "paragraph 2", ...],
  "pull_quote": "A single compelling sentence from the article for callout display",
  "quality_assessment": "Evidence quality: RATING. Description of quality with specific numbers.",
  "research_score_rationale": "We rate X research as Y quality because: (1)... (2)... (3)..."
}

## Style rules
- Use **bold** for emphasis sparingly.
- Paragraphs should be 3–5 sentences. Aim for 8–10 paragraphs total.
- No bullet lists in the body text — this is narrative journalism.
- Write byline as "The Sequence Research Team" (do not include this in the body).
- Inline PubMed links as markdown: [Author et al. (Year)](https://pubmed.ncbi.nlm.nih.gov/PMID/)
- Be skeptical of claims without evidence. Call out marketing hype.
- If the evidence is weak, say so clearly. If it's strong, give credit.`;

export interface ArticleGenerationInput {
  peptideName: string;
  peptideSlug: string;
  mechanism: string | null;
  aliases: string[];
  legalStatus: Record<string, string>;
  indicationsTags: string[];
  studies: Array<{
    id: string;
    title: string;
    year: number | null;
    journal: string | null;
    study_type: string | null;
    species: string | null;
    n_subjects: number | null;
    quality_score: number | null;
    conclusion: string | null;
    authors: string[] | null;
    primary_outcomes: unknown;
    risk_of_bias: unknown;
    highlights: unknown;
    dose: unknown;
  }>;
  researcher: {
    name: string;
    title: string;
    institution: string;
    labUrl: string;
    bio: string;
  };
}

export function buildArticleUserMessage(input: ArticleGenerationInput): string {
  const studyLines = input.studies.slice(0, 30).map((s) => {
    const outcomes = s.primary_outcomes ? JSON.stringify(s.primary_outcomes) : "none reported";
    const rob = s.risk_of_bias ? JSON.stringify(s.risk_of_bias) : "not assessed";
    const dose = s.dose ? JSON.stringify(s.dose) : "not reported";
    const highlights = s.highlights ? JSON.stringify(s.highlights) : "";
    return [
      `STUDY s-${s.id.slice(0, 8)}:`,
      `  Title: ${s.title}`,
      `  Authors: ${(s.authors ?? []).join(", ") || "unknown"}`,
      `  Year: ${s.year ?? "?"}  Journal: ${s.journal ?? "?"}`,
      `  Type: ${s.study_type ?? "?"}  Species: ${s.species ?? "?"}  N: ${s.n_subjects ?? "?"}`,
      `  Quality: ${s.quality_score?.toFixed(1) ?? "?"}`,
      `  Conclusion: ${s.conclusion ?? "none"}`,
      `  Outcomes: ${outcomes}`,
      `  Dose: ${dose}`,
      `  Risk of Bias: ${rob}`,
      `  Highlights: ${highlights}`,
    ].join("\n");
  });

  const legal = Object.entries(input.legalStatus)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ") || "no regulatory data";

  return `PEPTIDE: ${input.peptideName}
SLUG: ${input.peptideSlug}
ALIASES: ${input.aliases.join(", ") || "none"}
MECHANISM: ${input.mechanism ?? "not characterized"}
INDICATIONS: ${input.indicationsTags.join(", ")}
LEGAL STATUS: ${legal}

RESEARCHER:
  Name: ${input.researcher.name}
  Title: ${input.researcher.title}
  Institution: ${input.researcher.institution}
  Lab URL: ${input.researcher.labUrl}
  Bio: ${input.researcher.bio}

STUDY DATA (${input.studies.length} studies, top 30 by quality):

${studyLines.join("\n\n")}

Write the JSON article now.`;
}
