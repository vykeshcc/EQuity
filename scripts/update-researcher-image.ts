/**
 * Updates the researcher imageUrl for a specific article.
 *
 * Usage:
 *   npx tsx scripts/update-researcher-image.ts --slug bpc-157-wound-healing --url "https://..."
 *
 * To list all articles and their current researcher images:
 *   npx tsx scripts/update-researcher-image.ts --list
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(url, key);

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function list() {
  const { data, error } = await db
    .from("articles")
    .select("slug, title, researcher")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) { console.error(error.message); process.exit(1); }

  console.log("\nCurrent researcher images:\n");
  for (const a of data ?? []) {
    const r = a.researcher as { name?: string; imageUrl?: string };
    console.log(`  slug:     ${a.slug}`);
    console.log(`  name:     ${r?.name ?? "—"}`);
    console.log(`  imageUrl: ${r?.imageUrl ?? "—"}`);
    console.log();
  }
}

async function update(slug: string, imageUrl: string) {
  const { data: article, error: fetchErr } = await db
    .from("articles")
    .select("slug, researcher")
    .eq("slug", slug)
    .single();

  if (fetchErr || !article) {
    console.error(`Article not found: ${slug}`);
    process.exit(1);
  }

  const updated = { ...(article.researcher as object), imageUrl };

  const { error } = await db
    .from("articles")
    .update({ researcher: updated })
    .eq("slug", slug);

  if (error) {
    console.error(`Failed: ${error.message}`);
    process.exit(1);
  }

  console.log(`✓ Updated researcher image for: ${slug}`);
  console.log(`  New URL: ${imageUrl}`);
}

async function main() {
  const doList = process.argv.includes("--list");
  const slug = arg("slug");
  const imageUrl = arg("url");

  if (doList) {
    await list();
    return;
  }

  if (!slug || !imageUrl) {
    console.error("Usage:");
    console.error("  --list                          Show all current researcher images");
    console.error("  --slug <slug> --url <image-url> Update a specific article");
    process.exit(1);
  }

  await update(slug, imageUrl);
}

main();
