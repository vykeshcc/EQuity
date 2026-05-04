import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import type { Metadata } from "next";

export const revalidate = 300;

interface Researcher {
  name: string;
  title: string;
  institution: string;
  labUrl: string;
  imageUrl?: string;
  bio: string;
}

interface Reference {
  label: string;
  url: string;
}

interface Article {
  id: string;
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  hero_image: string;
  hero_alt: string;
  reading_time: number;
  published_at: string;
  body: string[];
  pull_quote: string | null;
  quality_assessment: string | null;
  research_score_rationale: string | null;
  researcher: Researcher;
  article_references: Reference[];
  peptide_id: string | null;
}

async function getArticle(slug: string) {
  const db = getDb();
  const { data } = await db
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as Article | null;
}

async function getAdjacentArticles(publishedAt: string) {
  const db = getDb();
  const [{ data: prev }, { data: next }] = await Promise.all([
    db.from("articles").select("slug,title").eq("status", "published")
      .lt("published_at", publishedAt).order("published_at", { ascending: false }).limit(1).single(),
    db.from("articles").select("slug,title").eq("status", "published")
      .gt("published_at", publishedAt).order("published_at", { ascending: true }).limit(1).single(),
  ]);
  return { prev, next };
}

async function getPeptideInfo(peptideId: string | null) {
  if (!peptideId) return null;
  const db = getDb();
  const { data } = await db.from("peptides").select("slug,name,study_count,mechanism").eq("id", peptideId).single();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.title} — The Sequence Journal`,
    description: article.subtitle,
    authors: [{ name: "The Sequence Research Team" }],
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: "article",
      publishedTime: article.published_at,
      authors: ["The Sequence Research Team"],
      images: [{ url: article.hero_image, alt: article.hero_alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.subtitle,
      images: [article.hero_image],
    },
  };
}

function renderBodyParagraph(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>;

    const linkMatch = part.match(/^\[(.+)\]\((.+)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [adjacentArticles, peptide] = await Promise.all([
    getAdjacentArticles(article.published_at),
    getPeptideInfo(article.peptide_id),
  ]);

  const { prev, next } = adjacentArticles;
  const researcher = article.researcher as Researcher;
  const references = article.article_references as Reference[];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.subtitle,
    image: article.hero_image,
    datePublished: article.published_at,
    author: {
      "@type": "Organization",
      name: "The Sequence Research Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Sequence — Peptide Evidence",
    },
  };

  const pullQuoteIndex = Math.min(3, Math.floor(article.body.length / 2));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="crumb">
        <Link href="/">Sequence</Link>
        <span className="sep">/</span>
        <Link href="/journal">Journal</Link>
        <span className="sep">/</span>
        <span>{article.title.length > 50 ? article.title.slice(0, 50) + "…" : article.title}</span>
      </div>

      <article>
        <header className="article-header">
          <div className="category">{article.category}</div>
          <h1>{article.title}</h1>
          <p className="deck">{article.subtitle}</p>
          <div className="byline-bar">
            <span>The Sequence Research Team</span>
            <span className="sep">·</span>
            <span>{article.reading_time} min read</span>
            <span className="sep">·</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </header>

        <div className="article-hero-image">
          <Image
            src={article.hero_image}
            alt={article.hero_alt}
            fill
            sizes="(max-width: 1080px) 100vw, 1080px"
            priority
          />
        </div>

        <div className="article-layout">
          <div className="article-body">
            {article.body.map((para, i) => (
              <div key={i}>
                <p>{renderBodyParagraph(para)}</p>
                {i === pullQuoteIndex && article.pull_quote && (
                  <blockquote className="pull-quote">{article.pull_quote}</blockquote>
                )}
              </div>
            ))}

            {article.quality_assessment && (
              <div className="quality-assessment">
                <h3>Research Quality Assessment</h3>
                <p>{article.quality_assessment}</p>
                {article.research_score_rationale && (
                  <p style={{ marginTop: 12 }}>{article.research_score_rationale}</p>
                )}
              </div>
            )}
          </div>

          <aside className="article-sidebar">
            {researcher?.name && (
              <div className="researcher-card">
                {researcher.imageUrl && (
                  <div className="researcher-photo">
                    <Image
                      src={researcher.imageUrl}
                      alt={researcher.name}
                      fill
                      sizes="300px"
                    />
                  </div>
                )}
                <div className="researcher-name">{researcher.name}</div>
                <div className="researcher-title">{researcher.title}</div>
                <div className="researcher-institution">{researcher.institution}</div>
                <p className="researcher-bio">{researcher.bio}</p>
                {researcher.labUrl && (
                  <a
                    href={researcher.labUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="researcher-link"
                  >
                    Visit lab page →
                  </a>
                )}
              </div>
            )}

            {peptide && (
              <Link href={`/peptides/${peptide.slug}`} className="peptide-link-card">
                <div className="peptide-link-name">{peptide.name}</div>
                <div className="peptide-link-meta">
                  {peptide.study_count ?? 0} studies indexed
                </div>
                <div className="peptide-link-cta">View full evidence profile →</div>
              </Link>
            )}

            {references.length > 0 && (
              <div>
                <div style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  color: "var(--ink-3)",
                  marginBottom: 10,
                }}>
                  References
                </div>
                <ul className="ref-list">
                  {references.map((ref, i) => (
                    <li key={i}>
                      <span className="ref-num">[{i + 1}]</span>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer">
                        {ref.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>

      <nav className="article-nav">
        <div>
          {prev && (
            <Link href={`/journal/${prev.slug}`}>
              ← Previous
              <span className="nav-title">{prev.title}</span>
            </Link>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          {next && (
            <Link href={`/journal/${next.slug}`}>
              Next →
              <span className="nav-title">{next.title}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
