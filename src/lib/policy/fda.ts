import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude, parseJsonResponse } from "@/lib/claude/client";
import { embed, toPgVector } from "@/lib/embeddings/embed";
import { hashString } from "@/lib/utils/cn";

/**
 * FDA policy ingestion: pulls the compounding + press-announcement feeds,
 * asks Claude to classify relevance + which peptide each item applies to.
 *
 * RSS feeds used:
 *   - FDA press announcements: https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-announcements/rss.xml
 *   - Compounding drug shortages (useful for peptide compounding updates): https://www.fda.gov/drugs/drug-shortages/rss.xml
 */

const FDA_FEEDS = [
  "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-announcements/rss.xml",
  "https://www.fda.gov/drugs/news-events-human-drugs/rss.xml",
];

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
}

async function fetchFeed(url: string): Promise<FeedItem[]> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`FDA feed ${r.status}`);
  const xml = await r.text();
  const items: FeedItem[] = [];
  for (const block of xml.split(/<item>/).slice(1)) {
    const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const description = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.trim() ?? "";
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
    if (title && link) items.push({ title, link, description, pubDate });
  }
  return items;
}

const CLASSIFY_SYSTEM = `You are a regulatory-analyst assistant for peptide science. Given an FDA news item + a list of peptides we track, decide if the item is relevant to any of them.

Return JSON: { relevant: boolean, peptide_slug: string | null, status: "banned"|"restricted"|"approved"|"Rx"|"OTC"|"under-review"|null, effective_date: "YYYY-MM-DD" | null, summary: string }

Be strict. Only mark relevant=true if a tracked peptide (by name, alias, or clear drug class) is meaningfully addressed. \`summary\` ≤ 60 words.`;

export async function ingestFdaPolicy(db: SupabaseClient): Promise<{ checked: number; added: number; errors: string[] }> {
  const result = { checked: 0, added: 0, errors: [] as string[] };

  const { data: peptides } = await db.from("peptides").select("slug,name,aliases");
  const peptideList = (peptides ?? [])
    .map((p) => `${p.slug} (${p.name}${p.aliases?.length ? "; " + p.aliases.join(", ") : ""})`)
    .join("\n");

  const seen = new Set<string>();
  const items: FeedItem[] = [];
  for (const url of FDA_FEEDS) {
    try {
      const feed = await fetchFeed(url);
      for (const it of feed) {
        if (!seen.has(it.link)) {
          seen.add(it.link);
          items.push(it);
        }
      }
    } catch (err: any) {
      result.errors.push(`${url}: ${err.message}`);
    }
  }

  for (const it of items) {
    result.checked++;
    const hash = hashString(it.link);
    const { data: existing } = await db
      .from("policy_items")
      .select("id")
      .eq("source_hash", hash)
      .limit(1)
      .maybeSingle();
    if (existing) continue;

    try {
      const res = await callClaude({
        system: [{ text: CLASSIFY_SYSTEM, cache: true }],
        messages: [
          {
            role: "user",
            content: `TRACKED PEPTIDES:\n${peptideList}\n\nFDA ITEM:\nTITLE: ${it.title}\nLINK: ${it.link}\nDATE: ${it.pubDate ?? "?"}\nDESC: ${it.description}\n\nClassify. Return JSON only.`,
          },
        ],
        maxTokens: 512,
        temperature: 0,
      });
      const j = parseJsonResponse<any>(res.text);
      if (!j.relevant) continue;

      let peptide_id: string | null = null;
      if (j.peptide_slug) {
        const { data: p } = await db.from("peptides").select("id").eq("slug", j.peptide_slug).maybeSingle();
        peptide_id = p?.id ?? null;
      }

      const [vec] = await embed([`${it.title}\n\n${j.summary}`]);
      await db.from("policy_items").insert({
        jurisdiction: "FDA",
        status: j.status ?? "under-review",
        peptide_id,
        title: it.title,
        summary: j.summary,
        effective_date: j.effective_date ?? null,
        source_url: it.link,
        source_hash: hash,
        embedding: toPgVector(vec),
      });
      result.added++;
    } catch (err: any) {
      result.errors.push(`${it.link}: ${err.message}`);
    }
  }
  return result;
}
