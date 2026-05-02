/**
 * Generate articles for peptides with uncovered studies.
 *
 * Usage:
 *   npx tsx scripts/generate-articles.ts
 *   npx tsx scripts/generate-articles.ts --peptide bpc-157
 *   npx tsx scripts/generate-articles.ts --max 5
 */
import { generateAndPersistArticle } from "@/lib/extraction/generate-article";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(url, key);

const args = process.argv.slice(2);
const peptideFlag = args.indexOf("--peptide");
const maxFlag = args.indexOf("--max");
const targetPeptide = peptideFlag >= 0 ? args[peptideFlag + 1] : null;
const maxArticles = maxFlag >= 0 ? parseInt(args[maxFlag + 1], 10) : 5;

async function main() {
  let peptideSlugs: string[];

  if (targetPeptide) {
    peptideSlugs = [targetPeptide];
  } else {
    const { data } = await db
      .from("peptides")
      .select("slug")
      .order("study_count", { ascending: false })
      .limit(maxArticles);
    peptideSlugs = (data ?? []).map((p) => p.slug);
  }

  console.log(`Generating articles for ${peptideSlugs.length} peptide(s)…\n`);

  let generated = 0;
  for (const slug of peptideSlugs) {
    if (generated >= maxArticles) break;

    const result = await generateAndPersistArticle(slug, {
      name: "Research Team",
      title: "Research Analyst",
      institution: "Sequence Research Team",
      labUrl: "",
      bio: "The Sequence Research Team synthesizes evidence from peer-reviewed literature to produce accessible, honest assessments of peptide science.",
    });

    if (result) {
      generated++;
      console.log(`  Created: ${result.slug} (${result.id})`);
    }

    if (generated < maxArticles) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\nDone. ${generated} article(s) generated as drafts.`);
  console.log("To publish, update status to 'published' in the articles table.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
