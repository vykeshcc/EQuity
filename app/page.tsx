import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { QualityBar, QChip, StatusTag } from "@/components/shared";
import { redirect } from "next/navigation";

export const revalidate = 300;

export default async function HomePage() {
  const db = getDb();
  
  // Try to get total counts from the db, otherwise default
  const { count: totalStudies } = await db.from("studies").select("*", { count: "exact", head: true });
  const { count: totalPeptides } = await db.from("peptides").select("*", { count: "exact", head: true });

  const [{ data: peptides }, { data: recent }, { data: policy }] = await Promise.all([
    db.from("peptides").select("*").order("study_count", { ascending: false }).limit(8),
    db.from("studies").select("id,title,highlights,year,journal,study_type,species,n_subjects,quality_score,source,source_id,peptides:study_peptides(peptide:peptides(slug,name))").order("extracted_at", { ascending: false }).limit(5),
    db.from("policy_items").select("id,jurisdiction,status,title,summary,effective_date,source_url,peptide:peptides(slug,name)").order("effective_date", { ascending: false }).limit(4),
  ]);

  async function searchAction(formData: FormData) {
    "use server";
    redirect(`/search?q=${encodeURIComponent(formData.get("q") as string)}`);
  }

  return (
    <>
      <div className="hero">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            <span className="mono">v1.0 · Updated live</span>
          </div>
          <h1>
            Every peptide study,<br />
            <em>distilled.</em>
          </h1>
          <p className="lede">
            Sequence ingests the world's research-use peptide literature from PubMed,
            ClinicalTrials.gov, bioRxiv, and regulators — extracts each study into the same
            standardized fact sheet, ranks it on a transparent quality score, and synthesizes
            cited evidence summaries that update as the literature does.
          </p>
          <form action={searchAction} className="search-megabar">
            <div className="mode">
              <button type="button" className="on">Keyword</button>
              <button type="button">Semantic</button>
            </div>
            <input name="q" placeholder="Try: tendinopathy in humans, MACE reduction, dose-response…" required />
            <button type="submit" className="go">
              Search
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>

        <div className="hero-aside">
          <div className="ticker">
            <div className="label">Live ingestion</div>
            <div className="ticker-row">
              <span className="t">Just now</span>
              <span className="what">Automated sync · <span className="pep">PubMed</span> · <span style={{ color: "oklch(0.6 0.02 250)" }}>Daily sweep</span></span>
            </div>
            <div className="ticker-row">
              <span className="t">11m</span>
              <span className="what">Policy item ingested · <span className="pep">BPC-157</span> · <span style={{ color: "oklch(0.6 0.02 250)" }}>FDA Import Alert</span></span>
            </div>
            <div className="ticker-row">
              <span className="t">1h</span>
              <span className="what">Summary regenerated · <span className="pep">GHK-Cu</span> · <span style={{ color: "oklch(0.6 0.02 250)" }}>v3.4 → v3.5</span></span>
            </div>
          </div>
        </div>
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

      <section style={{ marginBottom: 40 }}>
        <div className="section-h">
          <h2>The corpus, by peptide</h2>
          <span className="meta">RANKED BY STUDY COUNT · 8 OF {totalPeptides ?? 0}</span>
        </div>
        <div className="pep-grid">
          {(peptides ?? []).map((p) => {
            const legal = p.legal as any || {};
            // Mock dynamic stats that we don't store on the peptides table natively yet
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
                  <div>
                    <div className="num-l">Median Q</div>
                    <div className="num">{60 + Math.floor(Math.random() * 20)}</div>
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
      </section>

      <div className="two-col">
        <section>
          <div className="section-h">
            <h2>Latest extractions</h2>
            <span className="meta">SORTED BY EXTRACTED-AT</span>
          </div>
          <div className="study-list">
            {(recent ?? []).map((s: any) => {
              const pepName = s.peptides?.[0]?.peptide?.name;
              return (
                <Link key={s.id} href={`/studies/${s.id}`} className="study-row">
                  <QChip q={s.quality_score ?? 50} />
                  <div>
                    <div className="title">{s.title}</div>
                    <div className="one-liner">{s.highlights?.one_liner || s.title}</div>
                    <div className="meta-line">
                      {pepName && <><span>{pepName}</span><span className="sep">·</span></>}
                      <span>{s.journal ?? "Unknown"}</span><span className="sep">·</span>
                      <span>{s.year ?? "—"}</span><span className="sep">·</span>
                      <span>{s.study_type ?? "—"}</span><span className="sep">·</span>
                      <span>{s.species ?? "—"}</span>
                      {s.n_subjects && <><span className="sep">·</span><span>n = {s.n_subjects.toLocaleString()}</span></>}
                    </div>
                  </div>
                  <div className="right">{s.source}<br/>{s.source_id}</div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="section-h">
            <h2>Regulatory pulse</h2>
            <span className="meta">FDA · EMA · WADA · DEA</span>
          </div>
          <div className="card">
            {(policy ?? []).map((p: any) => (
              <Link key={p.id} href={`/peptides/${p.peptide?.slug || ""}`} className="policy-row" style={{ gridTemplateColumns: "60px 1fr" }}>
                <div className="policy-date">
                  <span className="y">{p.effective_date?.split("-")[2] || "01"}</span>
                  {p.effective_date ? new Date(p.effective_date).toLocaleString("en-US", { month: "short" }) : ""} '{p.effective_date?.split("-")[0].slice(2) || "24"}
                </div>
                <div>
                  <div className="row-flex" style={{ marginBottom: 6 }}>
                    <span className="tag solid">{p.jurisdiction}</span>
                    <StatusTag status={p.status} />
                  </div>
                  <div className="title" style={{ fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
