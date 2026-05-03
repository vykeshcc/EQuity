/**
 * Generates evidence summaries for peptides that don't have one yet.
 * Run: npx tsx --env-file=.env.local scripts/generate-summaries.ts
 * Run for one: npx tsx --env-file=.env.local scripts/generate-summaries.ts bpc-157
 */
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const MODEL = process.env.GOOGLE_EXTRACTION_MODEL || "gemini-2.5-flash";
const PROMPT_VERSION = "evidence-summary-v1";

if (!SUPABASE_URL || !SERVICE_KEY || !GOOGLE_API_KEY) {
  console.error("Missing required env vars");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const targetSlug = process.argv[2] ?? null;

async function generateSummaryForPeptide(peptide: { id: string; name: string }) {
  const { data: studies } = await db
    .from("studies")
    .select("id,year,journal,study_type,species,n_subjects,quality_score,conclusion,primary_outcomes,study_peptides!inner(peptide_id)")
    .eq("study_peptides.peptide_id", peptide.id)
    .order("quality_score", { ascending: false })
    .limit(40);

  if (!studies?.length) {
    console.log(`  ↷ ${peptide.name}: no studies, skipping`);
    return null;
  }

  const studiesSummary = studies.map((s: any) => ({
    year: s.year,
    journal: s.journal,
    study_type: s.study_type,
    species: s.species,
    n: s.n_subjects,
    quality: s.quality_score,
    conclusion: s.conclusion?.slice(0, 300),
    outcomes: s.primary_outcomes?.slice(0, 3),
  }));

  const system = `You are a rigorous science communicator writing for an evidence-based peptide research platform. Your role is to synthesize research honestly, noting limitations and gaps. Write clearly for an educated lay audience.`;

  const userMsg = `Synthesize the evidence for ${peptide.name} based on these ${studies.length} studies:

${JSON.stringify(studiesSummary, null, 2)}

Return JSON with exactly these fields:
{
  "summary": "3-4 paragraph evidence summary. Open with the strongest finding. Discuss study quality, species limitations, human evidence gaps, and honest bottom line. 300-400 words.",
  "citations": ["study_type year journal", "..."] // top 5 most important studies cited
}`;

  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: system,
    generationConfig: { maxOutputTokens: 1200, temperature: 0.2 },
  });

  const result = await model.generateContent(userMsg);
  const text = result.response.text();

  // Parse JSON
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{");
  const parsed = JSON.parse(body.slice(start)) as { summary: string; citations: string[] };

  // Check if summary already exists
  const { data: existing } = await db
    .from("peptide_evidence_summaries")
    .select("id")
    .eq("peptide_id", peptide.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let row;
  if (existing) {
    // Update existing
    const { data } = await db
      .from("peptide_evidence_summaries")
      .update({
        summary: parsed.summary,
        citations: parsed.citations ?? [],
        model: MODEL,
        prompt_version: PROMPT_VERSION,
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    row = data;
  } else {
    const { data } = await db
      .from("peptide_evidence_summaries")
      .insert({
        peptide_id: peptide.id,
        summary: parsed.summary,
        citations: parsed.citations ?? [],
        model: MODEL,
        prompt_version: PROMPT_VERSION,
      })
      .select("id")
      .single();
    row = data;
  }

  return row ? { id: row.id, summary: parsed.summary.slice(0, 80) + "…" } : null;
}

async function main() {
  let peptides: Array<{ id: string; name: string; slug: string }> = [];

  if (targetSlug) {
    const { data } = await db.from("peptides").select("id,name,slug").eq("slug", targetSlug).single();
    if (!data) { console.error(`Peptide not found: ${targetSlug}`); process.exit(1); }
    peptides = [data];
  } else {
    const { data } = await db
      .from("peptides")
      .select("id,name,slug")
      .order("study_count", { ascending: false })
      .limit(30);
    peptides = data ?? [];
  }

  console.log(`Generating evidence summaries for ${peptides.length} peptide(s) using ${MODEL}…\n`);

  let ok = 0, skip = 0, err = 0;
  for (const p of peptides) {
    process.stdout.write(`  ${p.name}… `);
    try {
      const result = await generateSummaryForPeptide(p);
      if (result) {
        console.log(`✓`);
        ok++;
      } else {
        skip++;
      }
    } catch (e: any) {
      console.log(`✗ ${e.message?.slice(0, 80)}`);
      err++;
    }
  }

  console.log(`\nDone: ${ok} generated, ${skip} skipped (no studies), ${err} errors`);
}

main();
