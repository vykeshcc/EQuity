import { callClaude, parseJsonResponse } from "@/lib/claude/client";
import { ARTICLE_SYSTEM, ARTICLE_PROMPT_VERSION, buildArticleUserMessage, type ArticleGenerationInput } from "@/lib/prompts/article.v1";
import { getAdminDb } from "@/lib/db/client";

const HERO_IMAGES: Record<string, string> = {
  "PEPTIDE SCIENCE": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=800&fit=crop",
  "CLINICAL FRONTIERS": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop",
  "LONGEVITY SCIENCE": "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1200&h=800&fit=crop",
  "DEEP DIVE": "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=1200&h=800&fit=crop",
  "EXERCISE BIOLOGY": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop",
};

const HERO_ALTS: Record<string, string> = {
  "PEPTIDE SCIENCE": "Laboratory research and molecular science",
  "CLINICAL FRONTIERS": "Clinical research and medical science",
  "LONGEVITY SCIENCE": "DNA and molecular biology visualization",
  "DEEP DIVE": "Cellular biology and scientific research",
  "EXERCISE BIOLOGY": "Exercise physiology and movement science",
};

interface GeneratedArticle {
  title: string;
  subtitle: string;
  category: string;
  body: string[];
  pull_quote: string;
  quality_assessment: string;
  research_score_rationale: string;
}

export async function generateArticle(input: ArticleGenerationInput): Promise<{
  article: GeneratedArticle;
  model: string;
  latencyMs: number;
  usage: { inputTokens: number; outputTokens: number };
}> {
  const userMessage = buildArticleUserMessage(input);

  const result = await callClaude({
    system: ARTICLE_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
    useHardModel: true,
    maxTokens: 8192,
    temperature: 0.3,
  });

  const article = parseJsonResponse<GeneratedArticle>(result.text);

  return {
    article,
    model: result.model,
    latencyMs: result.latencyMs,
    usage: { inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens },
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function generateAndPersistArticle(
  peptideSlug: string,
  researcher: ArticleGenerationInput["researcher"],
): Promise<{ slug: string; id: string } | null> {
  const db = getAdminDb();

  const { data: peptide } = await db
    .from("peptides")
    .select("id,name,slug,aliases,mechanism,indications_tags,legal_status")
    .eq("slug", peptideSlug)
    .single();

  if (!peptide) {
    console.error(`Peptide not found: ${peptideSlug}`);
    return null;
  }

  const { data: coveredStudyIds } = await db
    .from("article_sources")
    .select("study_id");
  const coveredSet = new Set((coveredStudyIds ?? []).map((r) => r.study_id));

  const { data: studies } = await db
    .from("studies")
    .select("id,title,year,journal,study_type,species,n_subjects,quality_score,conclusion,authors,primary_outcomes,risk_of_bias,highlights,dose")
    .in("id", (
      await db.from("study_peptides").select("study_id").eq("peptide_id", peptide.id)
    ).data?.map((r) => r.study_id) ?? [])
    .order("quality_score", { ascending: false })
    .limit(40);

  const uncoveredStudies = (studies ?? []).filter((s) => !coveredSet.has(s.id));

  if (uncoveredStudies.length === 0) {
    console.log(`No uncovered studies for ${peptideSlug}, skipping.`);
    return null;
  }

  const input: ArticleGenerationInput = {
    peptideName: peptide.name,
    peptideSlug: peptide.slug,
    mechanism: peptide.mechanism,
    aliases: peptide.aliases ?? [],
    legalStatus: (peptide.legal_status as Record<string, string>) ?? {},
    indicationsTags: peptide.indications_tags ?? [],
    studies: uncoveredStudies.slice(0, 30),
    researcher,
  };

  console.log(`Generating article for ${peptide.name} (${uncoveredStudies.length} uncovered studies)…`);

  const { article, model, latencyMs, usage } = await generateArticle(input);

  const slug = slugify(article.title);
  const category = article.category || "PEPTIDE SCIENCE";
  const heroImage = HERO_IMAGES[category] ?? HERO_IMAGES["PEPTIDE SCIENCE"];
  const heroAlt = HERO_ALTS[category] ?? HERO_ALTS["PEPTIDE SCIENCE"];

  const row = {
    slug,
    category,
    title: article.title,
    subtitle: article.subtitle,
    peptide_id: peptide.id,
    hero_image: heroImage,
    hero_alt: heroAlt,
    reading_time: Math.max(5, Math.ceil(article.body.join(" ").split(/\s+/).length / 200)),
    researcher: { ...researcher, imageUrl: researcher.bio ? "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop" : "" },
    references: [] as Array<{ label: string; url: string }>,
    body: article.body,
    pull_quote: article.pull_quote,
    quality_assessment: article.quality_assessment,
    research_score_rationale: article.research_score_rationale,
    generation_model: model,
    generation_prompt_version: ARTICLE_PROMPT_VERSION,
    status: "draft",
    published_at: null,
  };

  const { data: inserted, error } = await db
    .from("articles")
    .upsert(row, { onConflict: "slug" })
    .select("id,slug")
    .single();

  if (error) {
    console.error(`Failed to persist article: ${error.message}`);
    return null;
  }

  const studyIdsUsed = uncoveredStudies.slice(0, 30).map((s) => s.id);
  const sourceRows = studyIdsUsed.map((study_id) => ({
    article_id: inserted.id,
    study_id,
  }));
  await db.from("article_sources").upsert(sourceRows, { onConflict: "article_id,study_id" });

  console.log(`  ✓ ${slug} (${model}, ${latencyMs}ms, ${usage.inputTokens}+${usage.outputTokens} tokens)`);

  return { slug: inserted.slug, id: inserted.id };
}
