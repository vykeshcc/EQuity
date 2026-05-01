import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { Crumb } from "@/components/shared";
import { scoreBreakdown } from "@/lib/ranking/score";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();

  const { data: study } = await db
    .from("studies")
    .select("*, study_peptides(peptide:peptides(slug,name))")
    .eq("id", id)
    .maybeSingle();
  if (!study) notFound();

  const peptideSlug = study.study_peptides?.[0]?.peptide?.slug;
  const peptideName = study.study_peptides?.[0]?.peptide?.name;

  let related: any[] = [];
  if (peptideSlug) {
    const { data } = await db.from("studies")
      .select("id,title,study_type,year,quality_score,study_peptides!inner(peptide_id)")
      .eq("study_peptides.peptide_id", (study.study_peptides?.[0]?.peptide as any)?.id)
      .neq("id", id)
      .order("quality_score", { ascending: false, nullsFirst: false })
      .limit(3);
    related = data ?? [];
  }

  // Calculate quality factors using real breakdown
  const q = study.quality_score ?? study.quality ?? 50;
  
  const scoreInput = {
    study_type: study.study_type,
    species: study.species,
    n_subjects: study.n_subjects,
    year: study.year,
    risk_of_bias: study.rob || study.risk_of_bias?.overall || study.risk_of_bias,
  };
  const breakdown = scoreBreakdown(scoreInput);

  const tldr = study.tldr || study.highlights?.tldr || [study.one_liner || study.highlights?.one_liner || "Summary unavailable"];
  
  const primaryOutcomes = study.primary_outcomes || [];
  const secondaryOutcomes = study.secondary_outcomes || [];
  const ae = study.adverse_events || study.ae || [];
  const designObj = typeof study.design === "object" ? study.design : { description: study.design || "Unknown" };

  return (
    <>
      <Crumb items={[
        { label: "Sequence", href: "/" },
        { label: "Studies", href: "/search" },
        { label: study.title.length > 60 ? study.title.slice(0, 60) + "…" : study.title }
      ]} />

      <header style={{ marginBottom: 28 }}>
        <div className="row-flex" style={{ marginBottom: 12 }}>
          {study.study_type && <span className="tag solid">{study.study_type.toUpperCase()}</span>}
          {peptideName && <span className="tag accent">{peptideName}</span>}
          {study.doi && <span className="tag mono">DOI {study.doi}</span>}
          <span className="tag mono">{study.source} {study.source_id}</span>
          {(study.rob || study.risk_of_bias) && (
            <span className="tag" style={{
              background: (study.rob || study.risk_of_bias) === "low" ? "var(--good-tint)" : "var(--warn-tint)",
              color: (study.rob || study.risk_of_bias) === "low" ? "var(--accent-deep)" : "var(--warn-deep)",
              borderColor: "transparent"
            }}>RoB {study.rob || study.risk_of_bias}</span>
          )}
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 38, fontWeight: 400, letterSpacing: "-0.02em", margin: "4px 0 12px", lineHeight: 1.05, maxWidth: 920, textWrap: "balance" }}>
          {study.title}
        </h1>
        {study.authors && study.authors.length > 0 && (
          <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 4 }}>
            {Array.isArray(study.authors) ? study.authors.join(", ") : study.authors}
          </div>
        )}
        <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {study.journal || "Unknown journal"} · {study.year || "Unknown year"}
        </div>
      </header>

      <div className="two-col">
        <section>
          {/* TLDR */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-h">
              <h3>TL;DR</h3>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>CLAUDE · BULLETS</span>
            </div>
            <div className="card-body">
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {tldr.map((t: string, i: number) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 10, alignItems: "baseline" }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--accent-deep)", fontWeight: 600 }}>0{i + 1}</span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.5, textWrap: "pretty" }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="section-h">
            <h2>Standardized fact sheet</h2>
            <span className="meta">EXTRACTED · CLAUDE SONNET 4.6 · v1.4</span>
          </div>
          <dl className="fact" style={{ marginBottom: 24 }}>
            <FactRow label="Study type" value={study.study_type || "—"} />
            <FactRow label="Species" value={study.species || "—"} />
            <FactRow label="N (subjects)" value={study.n_subjects ? study.n_subjects.toLocaleString() : "—"} />
            <FactRow label="Design" value={
              <span>
                {Object.entries(designObj || {}).map(([k, v]) => (
                  <span key={k} className="tag" style={{ marginRight: 4, marginBottom: 4 }}>
                    {k.replace(/_/g, " ")}{typeof v === "number" ? `: ${v}` : typeof v === "string" ? `: ${v}` : ""}
                  </span>
                ))}
              </span>
            } />
            <FactRow label="Duration" value={study.duration_days ? `${study.duration_days} days` : "—"} />
            <FactRow label="Route" value={study.route || "—"} />
            {study.dose && study.dose.length > 0 && <FactRow label="Dose" value={
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {study.dose.map((d: any, i: number) => (
                  <span key={i} className="mono" style={{ fontSize: 13 }}>
                    {d.peptide ? <strong style={{ fontWeight: 600 }}>{d.peptide}</strong> : ""} {d.amount_raw || (d.amount_mg != null ? `${d.amount_mg}mg` : "")} {d.route ? `, ${d.route}` : ""} {d.frequency ? `, ${d.frequency}` : ""} {d.total_days ? `, ${d.total_days}d` : ""}
                  </span>
                ))}
              </div>
            } />}
            {primaryOutcomes.length > 0 && (
              <FactRow label="Primary outcomes" value={
                <div>{primaryOutcomes.map((o: any, i: number) => <OutcomeLine key={i} o={o} />)}</div>
              } />
            )}
            {secondaryOutcomes.length > 0 && (
              <FactRow label="Secondary outcomes" value={
                <div>{secondaryOutcomes.map((o: any, i: number) => <OutcomeLine key={i} o={o} />)}</div>
              } />
            )}
            <FactRow label="Adverse events" value={
              ae.length === 0 ? <span style={{ color: "var(--ink-3)" }}>None reported</span> :
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {ae.map((e: any, i: number) => (
                    <div key={i} style={{ fontSize: 14 }}>
                      {e.event} <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>(n={e.count}, {e.severity})</span>
                    </div>
                  ))}
                </div>
            } />
            <FactRow label="Risk of bias" value={
              <span className="tag" style={{
                background: (study.rob || study.risk_of_bias) === "low" ? "var(--good-tint)" : "var(--warn-tint)",
                color: (study.rob || study.risk_of_bias) === "low" ? "var(--accent-deep)" : "var(--warn-deep)",
                borderColor: "transparent"
              }}>{study.rob || study.risk_of_bias || "—"}</span>
            } />
            <FactRow label="Conclusion" value={
              <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.55, textWrap: "pretty" }}>
                {study.conclusion || "—"}
              </p>
            } />
          </dl>

          <div className="row-flex">
            {(() => {
              const url = study.source_url || (study.doi ? `https://doi.org/${study.doi}` : (study.source === 'pubmed' ? `https://pubmed.ncbi.nlm.nih.gov/${study.source_id}/` : (study.source === 'clinicaltrials' ? `https://clinicaltrials.gov/study/${study.source_id}` : null)));
              return url ? <a href={url} target="_blank" rel="noreferrer" className="btn primary" style={{ textDecoration: "none" }}>Open original →</a> : null;
            })()}
            <button className="btn">Cite (BibTeX)</button>
            <button className="btn">Suggest correction</button>
            <button className="btn">👍</button>
            <button className="btn">👎</button>
          </div>
        </section>

        <aside>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h"><h3>Quality breakdown</h3><span className="mono" style={{ fontSize: 16, color: "var(--ink)", fontFamily: "var(--serif)" }}>{Math.round(q)}</span></div>
            <div className="card-body">
              <QualityFactor label="Study type" weight={35} contrib={breakdown.components.type} />
              <QualityFactor label="Species" weight={15} contrib={breakdown.components.species} />
              <QualityFactor label="N (log)" weight={20} contrib={breakdown.components.n} />
              <QualityFactor label="Recency" weight={15} contrib={breakdown.components.recency} />
              <QualityFactor label="Risk of bias (inv)" weight={15} contrib={breakdown.components.rob} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h"><h3>Provenance</h3></div>
            <div className="card-body" style={{ fontSize: 12, fontFamily: "var(--mono)", lineHeight: 1.7, color: "var(--ink-2)" }}>
              <div><span style={{ color: "var(--ink-3)" }}>extracted_at</span> &nbsp; {new Date(study.extracted_at || Date.now()).toISOString().split('T')[0]}</div>
              <div><span style={{ color: "var(--ink-3)" }}>model</span> &nbsp; {study.extraction_model || "claude-3-5-sonnet"}</div>
              <div><span style={{ color: "var(--ink-3)" }}>prompt_v</span> &nbsp; {study.extraction_version || "v1.4"}</div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="card">
              <div className="card-h"><h3>Related studies</h3></div>
              <div>
                {related.map(s => (
                  <Link key={s.id} href={`/studies/${s.id}`} style={{ display: "block", padding: "12px 16px", borderTop: "1px solid var(--line)", textDecoration: "none", color: "inherit" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--accent-deep)", fontWeight: 600 }}>{Math.round(s.quality_score ?? 50)}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.study_type} · {s.year}</span>
                    </div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 13, lineHeight: 1.35, textWrap: "pretty" }}>{s.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function FactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="fact-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function OutcomeLine({ o }: { o: any }) {
  const cls = o.direction === "improved" ? "up" : o.direction === "worsened" ? "down" : "flat";
  return (
    <div className="outcome">
      <span className="name">{o.name}</span>
      {o.effect_size && <span className={`effect ${cls}`}>{o.effect_size}</span>}
      <span className="stat-bits">
        {o.p_value && `p ${o.p_value}`} {o.ci && ` · 95% CI ${o.ci}`}
      </span>
    </div>
  );
}

function QualityFactor({ label, weight, contrib }: { label: string; weight: number; contrib: number }) {
  const pct = (contrib / weight) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12 }}>{label}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{contrib.toFixed(0)} / {weight}</span>
      </div>
      <div style={{ height: 4, background: "var(--paper-3)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: "var(--accent)" }} />
      </div>
    </div>
  );
}
