import Link from "next/link";
import Image from "next/image";
import { getDb } from "@/lib/db/client";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Sequence Journal — Peptide Research & Evidence",
  description:
    "In-depth articles on peptide science, clinical evidence, and the researchers advancing the field. Written by The Sequence Research Team.",
  openGraph: {
    title: "The Sequence Journal",
    description: "In-depth articles on peptide science, clinical evidence, and the researchers advancing the field.",
  },
};

export default async function JournalPage() {
  const db = getDb();

  const { data: articles } = await db
    .from("articles")
    .select("slug,category,title,subtitle,hero_image,hero_alt,reading_time,published_at,researcher")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (!articles || articles.length === 0) {
    return (
      <>
        <div className="journal-masthead">
          <span className="masthead-title">The Sequence Journal</span>
          <span className="masthead-meta">Peptide Research &amp; Evidence</span>
        </div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink-2)" }}>
          No articles published yet. Check back soon.
        </p>
      </>
    );
  }

  const hero = articles[0];
  const rest = articles.slice(1);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <div className="journal-masthead">
        <span className="masthead-title">The Sequence Journal</span>
        <span className="masthead-meta">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      <div className="cover-hero">
        <div>
          <div className="category">{hero.category}</div>
          <h1 className="headline">
            <Link href={`/journal/${hero.slug}`}>{hero.title}</Link>
          </h1>
          <p className="deck">{hero.subtitle}</p>
          <div className="byline">
            The Sequence Research Team
            <span className="reading-time">· {hero.reading_time} min read</span>
          </div>
          {hero.published_at && (
            <div className="byline" style={{ marginTop: 4 }}>{formatDate(hero.published_at)}</div>
          )}
        </div>
        <Link href={`/journal/${hero.slug}`} className="cover-hero-image">
          <Image
            src={hero.hero_image}
            alt={hero.hero_alt}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            priority
          />
        </Link>
      </div>

      {rest.length > 0 && (
        <div className="cover-grid" style={{ gridTemplateColumns: `repeat(${Math.min(rest.length, 4)}, 1fr)` }}>
          {rest.slice(0, 4).map((a) => (
            <Link key={a.slug} href={`/journal/${a.slug}`} className="cover-card">
              <div className="cover-card-image">
                <Image
                  src={a.hero_image}
                  alt={a.hero_alt}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                />
              </div>
              <div className="category">{a.category}</div>
              <div className="headline">{a.title}</div>
              <div className="deck">{a.subtitle}</div>
              <div className="byline">
                The Sequence Research Team · {a.reading_time} min
              </div>
            </Link>
          ))}
        </div>
      )}

      {rest.length > 4 && (
        <div className="journal-grid">
          {rest.slice(4).map((a) => (
            <Link key={a.slug} href={`/journal/${a.slug}`} className="journal-card">
              <div className="card-image">
                <Image
                  src={a.hero_image}
                  alt={a.hero_alt}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                />
              </div>
              <div className="category">{a.category}</div>
              <div className="headline">{a.title}</div>
              <div className="deck">{a.subtitle}</div>
              <div className="byline">
                The Sequence Research Team · {a.reading_time} min
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
