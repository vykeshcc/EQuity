import type { SupabaseClient } from "@supabase/supabase-js";
import { extractStudy } from "@/lib/extraction/extract";
import { persistStudy } from "@/lib/extraction/persist";

/**
 * PubMed E-utilities ingestion.
 * 1) esearch for each peptide name/alias → PMIDs
 * 2) esummary + efetch (XML) for title/abstract/journal/year/authors
 * 3) extract + persist
 *
 * Idempotent: writes raw_documents on (source='pubmed', source_id=PMID).
 */

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

interface PubmedArticle {
  pmid: string;
  doi?: string | null;
  title: string;
  abstract?: string | null;
  journal?: string | null;
  year?: number | null;
  authors: string[];
}

function apiKeyParam(): string {
  const k = process.env.PUBMED_API_KEY;
  return k ? `&api_key=${encodeURIComponent(k)}` : "";
}

async function esearch(term: string, retmax = 50, mindate?: string): Promise<string[]> {
  const dateFilter = mindate ? `&mindate=${mindate}&maxdate=3000&datetype=pdat` : "";
  const url = `${EUTILS}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${retmax}&retmode=json${dateFilter}${apiKeyParam()}`;
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`esearch ${r.status}`);
  const j = await r.json();
  return j.esearchresult?.idlist ?? [];
}

async function efetch(pmids: string[]): Promise<PubmedArticle[]> {
  if (!pmids.length) return [];
  const url = `${EUTILS}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&rettype=abstract&retmode=xml${apiKeyParam()}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`efetch ${r.status}`);
  const xml = await r.text();
  return parsePubmedXml(xml);
}

function parsePubmedXml(xml: string): PubmedArticle[] {
  // Lightweight XML parsing — PubMed XML is regular enough that we avoid a full DOM dep.
  const out: PubmedArticle[] = [];
  const articles = xml.split(/<PubmedArticle>/).slice(1);
  for (const block of articles) {
    const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
    if (!pmid) continue;
    const title = stripTags(block.match(/<ArticleTitle[^>]*>([\s\S]*?)<\/ArticleTitle>/)?.[1] ?? "");
    const abstract = Array.from(block.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g))
      .map((m) => stripTags(m[1]))
      .join("\n\n");
    const journal = stripTags(block.match(/<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>/)?.[1] ?? "") || null;
    const year = Number(block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] ?? "") || null;
    const authors = Array.from(
      block.matchAll(/<Author[^>]*>[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?<ForeName>([^<]+)<\/ForeName>[\s\S]*?<\/Author>/g),
    ).map((m) => `${m[2]} ${m[1]}`);
    const doi =
      block.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/)?.[1] ||
      block.match(/<ELocationID EIdType="doi"[^>]*>([^<]+)<\/ELocationID>/)?.[1] ||
      null;
    out.push({ pmid, title, abstract: abstract || null, journal, year, authors, doi });
  }
  return out;
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function buildQuery(peptide: { name: string; aliases: string[] }): string {
  const terms = [peptide.name, ...peptide.aliases].map((t) => `"${t}"[tiab]`);
  return terms.join(" OR ");
}

export interface PubmedIngestResult {
  peptide: string;
  fetched: number;
  newStudies: number;
  errors: string[];
}

export async function ingestPubmedForPeptide(
  db: SupabaseClient,
  peptide: { id: string; name: string; aliases: string[] },
  opts: { limit?: number; sinceDays?: number } = {},
): Promise<PubmedIngestResult> {
  const result: PubmedIngestResult = { peptide: peptide.name, fetched: 0, newStudies: 0, errors: [] };
  const limit = opts.limit ?? 25;

  let mindate: string | undefined;
  if (opts.sinceDays) {
    const d = new Date(Date.now() - opts.sinceDays * 86_400_000);
    mindate = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  }

  const pmids = await esearch(buildQuery(peptide), limit, mindate);
  // Skip PMIDs we've already ingested with current extraction version.
  const { data: existing } = await db
    .from("raw_documents")
    .select("source_id")
    .eq("source", "pubmed")
    .in("source_id", pmids);
  const have = new Set((existing ?? []).map((r) => r.source_id));
  const todo = pmids.filter((p) => !have.has(p));
  if (todo.length === 0) return result;

  const articles = await efetch(todo);
  for (const art of articles) {
    try {
      const { data: raw } = await db
        .from("raw_documents")
        .upsert(
          {
            source: "pubmed",
            source_id: art.pmid,
            doi: art.doi,
            title: art.title,
            abstract: art.abstract,
            payload: art as unknown as Record<string, unknown>,
          },
          { onConflict: "source,source_id" },
        )
        .select("id")
        .single();

      if (!art.abstract) {
        result.errors.push(`${art.pmid}: no abstract`);
        continue;
      }

      const extraction = await extractStudy({
        source: "pubmed",
        source_id: art.pmid,
        title: art.title,
        abstract: art.abstract,
        journal: art.journal,
        year: art.year,
        authors: art.authors,
        doi: art.doi,
      });

      await persistStudy({
        db,
        raw_document_id: raw?.id ?? null,
        source: "pubmed",
        source_id: art.pmid,
        extraction,
        source_url: `https://pubmed.ncbi.nlm.nih.gov/${art.pmid}/`,
      });
      result.newStudies++;
    } catch (err: any) {
      result.errors.push(`${art.pmid}: ${err.message}`);
    }
    result.fetched++;
  }
  return result;
}
