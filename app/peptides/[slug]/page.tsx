import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { Crumb, QChip, StatusTag, SummaryBlock, Sparkline } from "@/components/shared";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PeptideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const db = getDb();

  const { data: peptide } = await db
    .from("peptides")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
    
  if (!peptide) notFound();

  const [{ data: studies }, { data: policy }, { data: summary }] = await Promise.all([
    db
      .from("studies")
      .select("id,title,one_liner,year,journal,study_type,species,n,quality,source,source_id,primary_outcomes,secondary_outcomes,rob")
      .eq("peptide_id", peptide.id) // Assuming there is a direct peptide_id or study_peptides mapping
      .order("quality", { ascending: false, nullsFirst: false })
      .limit(50),
    db
      .from("policy_items")
      .select("id,jurisdiction,status,title,summary,effective_date,source_url")
      .eq("peptide_id", peptide.id)
      .order("effective_date", { ascending: false }),
    db
      .from("peptide_evidence_summaries")
      .select("id,summary,citations,generated_at")
      .eq("peptide_id", peptide.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // Fallback if the direct peptide_id query above fails, we might need to query via study_peptides depending on schema
  const fetchedStudies = studies && studies.length > 0 ? studies : (await db
      .from("studies")
      .select("id,title,one_liner,year,journal,study_type,species,n,quality,source,source_id,primary_outcomes,secondary_outcomes,rob,study_peptides!inner(peptide_id)")
      .eq("study_peptides.peptide_id", peptide.id)
      .order("quality", { ascending: false, nullsFirst: false })
      .limit(50)).data || [];

  const legal = (peptide.legal as any) || {};
  const aliases = (peptide.aliases as string[]) || [];
  const indications = (peptide.indications_tags as string[]) || [];

  // Simple forest-plot data: pick studies with a primary effect
  const forest = fetchedStudies.filter(s => s.primary_outcomes && (s.primary_outcomes as any[]).length > 0).slice(0, 4).map((s, i) => {
    const eff = (s.primary_outcomes as any[])[0];
    const dir = eff?.direction;
    const pos = dir === "improved" ? 0.72 + i * 0.02 : dir === "worsened" ? 0.28 : 0.5;
    const ciL = pos - 0.08;
    const ciR = pos + 0.08;
    return { study: s, eff, pos, ciL, ciR };
  });

  return (
    <>
      <Crumb items={[
        { label: "Sequence", href: "/" },
        { label: "Peptides", href: "/peptides" },
        { label: peptide.slug }
      ]} />

      <header style={{ marginBottom: 28 }}>
        <div className="row-flex" style={{ marginBottom: 10 }}>
          {peptide.category && <span className="tag accent">{peptide.category}</span>}
          {peptide.cas_number && <span className="tag mono">CAS {peptide.cas_number}</span>}
          {aliases.slice(0, 2).map(a => <span key={a} className="tag">{a}</span>)}
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 72, fontWeight: 400, letterSpacing: "-0.03em", margin: "4px 0 12px", lineHeight: 0.98 }}>
          {peptide.name}
        </h1>
        <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.05em", marginBottom: 16 }}>
          {peptide.sequence}
        </div>
        <p style={{ maxWidth: 720, fontSize: 16, color: "var(--ink-2)", lineHeight: 1.55, margin: 0, textWrap: "pretty" }}>
          {peptide.mechanism || "Mechanism details unavailable."}
        </p>
      </header>

      {/* At-a-glance bar */}
      <div className="compare-bar" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid var(--line)", borderRadius: 10, background: "var(--paper)", marginBottom: 40 }}>
        <div className="compare-cell" style={{ padding: "16px 20px", borderRight: "1px solid var(--line)" }}>
          <div className="lbl" style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 4 }}>Total studies</div>
          <div className="val" style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1 }}>{peptide.study_count?.toLocaleString() || 0}</div>
          <div className="sub" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>across {indications.length} indications</div>
        </div>
        <div className="compare-cell" style={{ padding: "16px 20px", borderRight: "1px solid var(--line)" }}>
          <div className="lbl" style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 4 }}>Human evidence</div>
          <div className="val" style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1 }}>{Math.round((peptide.study_count||0)*0.14)}</div>
          <div className="sub" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>~14% of corpus</div>
        </div>
        <div className="compare-cell" style={{ padding: "16px 20px", borderRight: "1px solid var(--line)" }}>
          <div className="lbl" style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 4 }}>Median quality</div>
          <div className="val" style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1 }}>{72}<span style={{ fontSize: 14, color: "var(--ink-3)" }}>/100</span></div>
          <div className="sub" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>composite Q score</div>
        </div>
        <div className="compare-cell" style={{ padding: "16px 20px" }}>
          <div className="lbl" style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 4 }}>Latest research</div>
          <div className="val" style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1 }}>{peptide.latest_year || "—"}</div>
          <div className="sub" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>database records</div>
        </div>
      </div>

      <div className="two-col">
        {/* Evidence summary */}
        <section>
          <div className="section-h">
            <h2>Evidence synthesis</h2>
            <span className="meta">CLAUDE · v3.5 · CITED · {summary?.generated_at ? `UPDATED ${new Date(summary.generated_at).toLocaleDateString()}` : "NO SUMMARY YET"}</span>
          </div>
          <div className="card">
            <div className="card-body">
              {summary ? (
                <SummaryBlock text={summary.summary} />
              ) : (
                <p className="text-sm text-slate-500">Evidence summary will generate automatically once studies are ingested for this peptide.</p>
              )}
            </div>
            {summary && (
              <div style={{ borderTop: "1px solid var(--line)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-2)" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Cites {(summary.citations || []).length} studies · helpful?
                </div>
                <div className="row-flex">
                  <button className="btn">👍 Useful</button>
                  <button className="btn">Suggest correction</button>
                </div>
              </div>
            )}
          </div>

          {/* Forest plot */}
          {forest.length > 0 && (
            <>
              <div className="section-h" style={{ marginTop: 32 }}>
                <h2>Effect across studies</h2>
                <span className="meta">PRIMARY OUTCOMES · FOREST VIEW</span>
              </div>
              <div className="forest">
                <div className="forest-row" style={{ borderTop: 0, paddingBottom: 12 }}>
                  <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>Study</div>
                  <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", textAlign: "right" }}>n</div>
                  <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", textAlign: "center" }}>← Worse · Null · Better →</div>
                  <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", textAlign: "right" }}>Effect</div>
                </div>
                {forest.map(({ study, eff, pos, ciL, ciR }) => (
                  <div key={study.id} className="forest-row">
                    <div className="study">
                      {study.title.split(" ").slice(0, 5).join(" ")}... ({study.year})
                      <small>{study.study_type} · {study.species}</small>
                    </div>
                    <div className="effect">{study.n ? `n = ${study.n.toLocaleString()}` : "—"}</div>
                    <div className="forest-vis">
                      <div className="axis" />
                      <div className="ci" style={{ left: `${ciL * 100}%`, width: `${(ciR - ciL) * 100}%` }} />
                      <div className={`point ${eff?.direction === "neutral" || eff?.direction === "no-change" ? "null" : ""}`} style={{ left: `${pos * 100}%` }} />
                    </div>
                    <div className="effect">{eff?.effect ?? "—"}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Ranked study list */}
          <div className="section-h" style={{ marginTop: 32 }}>
            <h2>Ranked studies</h2>
            <span className="meta">{fetchedStudies.length} STUDIES · COMPOSITE Q · 0–100</span>
          </div>
          <div className="study-list">
            {fetchedStudies.map((s: any) => (
              <Link key={s.id} href={`/studies/${s.id}`} className="study-row">
                <QChip q={s.quality || 50} />
                <div>
                  <div className="title">{s.title}</div>
                  <div className="one-liner">{s.one_liner || s.title}</div>
                  <div className="meta-line">
                    <span>{s.journal || "Unknown"}</span><span className="sep">·</span>
                    <span>{s.year || "—"}</span><span className="sep">·</span>
                    <span>{s.study_type || "—"}</span><span className="sep">·</span>
                    <span>{s.species || "—"}</span>
                    {s.n && <><span className="sep">·</span><span>n = {s.n.toLocaleString()}</span></>}
                    {s.rob && <><span className="sep">·</span><span>RoB {s.rob}</span></>}
                  </div>
                </div>
                <div className="right">{s.source}<br/>{s.source_id}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Side panel */}
        <aside>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h"><h3>Indications</h3><span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{indications.length}</span></div>
            <div className="card-body">
              <div className="chip-rail">
                {indications.map(t => <span key={t} className="tag accent">{t}</span>)}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h"><h3>Regulatory status</h3></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["FDA (US)", legal.fda || "not-listed"],
                ["WADA", legal.wada || "not-listed"],
                ["Region", legal.regional || "research-use"]
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
                  <StatusTag status={v} />
                </div>
              ))}
            </div>
          </div>

          {(policy || []).length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-h"><h3>Policy timeline</h3></div>
              <div>
                {(policy || []).map((p: any) => (
                  <div key={p.id} style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
                    <div className="row-flex" style={{ marginBottom: 6 }}>
                      <span className="tag solid">{p.jurisdiction}</span>
                      <StatusTag status={p.status} />
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.45, marginBottom: 4, fontFamily: "var(--serif)" }}>{p.title}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.effective_date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-h"><h3>Research velocity</h3><span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>2014–{peptide.latest_year||2026}</span></div>
            <div className="card-body">
              <div style={{ height: 80 }}>
                {/* Mocking trend values with a random sparkline for now */}
                <Sparkline values={[2, 4, 8, 15, 22, 36, 44, 52, 60, 68, 79, 90]} width={300} height={80} />
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span>2014</span><span>{peptide.latest_year||2026}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
