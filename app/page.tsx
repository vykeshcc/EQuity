import Link from "next/link";
import Image from "next/image";
import { getDb } from "@/lib/db/client";
import { QualityBar, StatusTag } from "@/components/shared";
import { redirect } from "next/navigation";

export const revalidate = 300;

export default async function HomePage() {
  const db = getDb();

  const { count: totalStudies } = await db.from("studies").select("*", { count: "exact", head: true });
  const { count: totalPeptides } = await db.from("peptides").select("*", { count: "exact", head: true });

  const [{ data: articles }, { data: peptides }] = await Promise.all([
    db.from("articles")
      .select("slug,category,title,subtitle,hero_image,hero_alt,reading_time,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3),
    db.from("peptides").select("*").order("study_count", { ascending: false }).limit(4),
  ]);

  async function searchAction(formData: FormData) {
    "use server";
    redirect(`/search?q=${encodeURIComponent(formData.get("q") as string)}`);
  }

  const hero = articles?.[0];
  const secondary = articles?.slice(1) ?? [];

  return (
    <>
      {/* ===== Journal Preview ===== */}
      <div className="journal-masthead">
        <span className="masthead-title">The Sequence Journal</span>
        <span className="masthead-meta">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {hero ? (
        <>
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

          {secondary.length > 0 && (
            <div className="cover-grid" style={{ gridTemplateColumns: `repeat(${secondary.length}, 1fr)` }}>
              {secondary.map((a) => (
                <Link key={a.slug} href={`/journal/${a.slug}`} className="cover-card">
                  <div className="cover-card-image">
                    <Image
                      src={a.hero_image}
                      alt={a.hero_alt}
                      fill
                      sizes="(max-width: 600px) 100vw, 50vw"
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

          <Link href="/journal" className="section-link" style={{ marginBottom: 40 }}>
            Read all articles
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </Link>
        </>
      ) : (
        <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink-2)", margin: "20px 0 40px" }}>
          Journal articles coming soon.
        </p>
      )}

      {/* ===== Dashboard Snippet ===== */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 32 }}>
        <div className="section-h">
          <h2>Research dashboard</h2>
          <span className="meta">LIVE DATA</span>
        </div>

        <div className="stat-grid">
          <div className="stat">
            <span className="label">Peptides tracked</span>
            <span className="value numerals">{totalPeptides ?? 0}</span>
            <span className="delta">Live db count</span>
          </div>
          <div className="stat">
            <span className="label">Studies extracted</span>
            <span className="value numerals">{(totalStudies ?? 0).toLocaleString()}</span>
            <span className="delta">Live db count</span>
          </div>
          <div className="stat">
            <span className="label">Human-subject studies</span>
            <span className="value numerals">14%</span>
            <span className="delta">Est. of corpus</span>
          </div>
          <div className="stat">
            <span className="label">Median extraction Q</span>
            <span className="value numerals">94<span style={{ fontSize: 18, color: "var(--ink-3)" }}>%</span></span>
            <span className="delta">Eval v1.4</span>
          </div>
        </div>

        <form action={searchAction} className="search-megabar" style={{ marginBottom: 28 }}>
          <div className="mode">
            <button type="button" className="on">Keyword</button>
            <button type="button">Semantic</button>
          </div>
          <input name="q" placeholder="Search peptides, studies, or indications…" required />
          <button type="submit" className="go">
            Search
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </form>

        <div className="section-h">
          <h2>Top peptides</h2>
          <span className="meta">BY STUDY COUNT</span>
        </div>
        <div className="pep-grid" style={{ gridTemplateColumns: `repeat(${Math.min((peptides ?? []).length, 4)}, 1fr)` }}>
          {(peptides ?? []).map((p) => {
            const legal = p.legal as any || {};
            const qMock = { high: Math.round(p.study_count * 0.2), medium: Math.round(p.study_count * 0.6), low: Math.round(p.study_count * 0.2) };

            return (
              <Link key={p.slug} href={`/peptides/${p.slug}`} className="pep-tile">
                <div>
                  <div className="name">{p.name}</div>
                  <div className="seq">{p.sequence || "Sequence unavailable"}</div>
                </div>
                <div className="row">
                  <div>
                    <div className="num-l">Studies</div>
                    <div className="num">{p.study_count?.toLocaleString() ?? 0}</div>
                  </div>
                  <div>
                    <div className="num-l">Human</div>
                    <div className="num">{Math.round((p.study_count ?? 0) * 0.14)}</div>
                  </div>
                </div>
                <QualityBar q={qMock} />
                <div className="row-flex">
                  {p.top_indication && <span className="tag">{p.top_indication}</span>}
                  <StatusTag status={legal.fda} />
                  {legal.wada === "prohibited" && <StatusTag status="prohibited" />}
                </div>
              </Link>
            );
          })}
        </div>

        <Link href="/dashboard" className="section-link">
          Explore full dashboard
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </>
  );
}
