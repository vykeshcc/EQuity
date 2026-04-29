import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { Crumb, StatusTag } from "@/components/shared";

export const revalidate = 300;

export default async function PolicyPage() {
  const db = getDb();
  const { data } = await db
    .from("policy_items")
    .select("id,jurisdiction,status,title,summary,effective_date,source_url,peptide:peptides(slug,name)")
    .order("effective_date", { ascending: false })
    .limit(100);

  return (
    <>
      <Crumb items={[{ label: "Sequence", href: "/" }, { label: "Policy" }]} />
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 400, letterSpacing: "-0.025em", margin: "4px 0 8px", lineHeight: 1 }}>
        Regulatory <em style={{ color: "var(--accent-deep)", fontStyle: "italic" }}>tracker</em>
      </h1>
      <p style={{ color: "var(--ink-2)", margin: "0 0 24px", maxWidth: 580 }}>
        FDA · EMA · WADA · DEA actions, cross-linked to peptide files. Updated nightly via RSS, classified by Claude.
      </p>

      <div className="filter-bar">
        <span className="facet active"><span className="k">All sources</span></span>
        <span className="facet"><span className="k">FDA</span></span>
        <span className="facet"><span className="k">EMA</span></span>
        <span className="facet"><span className="k">WADA</span></span>
        <span className="facet"><span className="k">DEA</span></span>
        <span style={{ width: 12 }} />
        <span className="facet"><span className="k">Approvals</span></span>
        <span className="facet"><span className="k">Warnings</span></span>
        <span className="facet"><span className="k">Bans</span></span>
        <span className="facet"><span className="k">Monitoring</span></span>
      </div>

      <div className="card">
        {(data ?? []).map((p: any) => {
          const pep = Array.isArray(p.peptide) ? p.peptide[0] : p.peptide;
          const dateParts = p.effective_date ? p.effective_date.split("-") : ["2026", "01", "01"];
          return (
            <div key={p.id} className="policy-row">
              <div className="policy-date">
                <span className="y">{dateParts[2]}</span>
                {p.effective_date ? new Date(p.effective_date).toLocaleString("en-US", { month: "short" }) : "Jan"} '{dateParts[0].slice(2)}
              </div>
              <div>
                <div className="row-flex" style={{ marginBottom: 8 }}>
                  <span className="tag solid">{p.jurisdiction}</span>
                  <StatusTag status={p.status} />
                  {pep && (
                    <Link href={`/peptides/${pep.slug}`} className="tag accent">
                      {pep.name}
                    </Link>
                  )}
                </div>
                <div className="title">{p.title}</div>
                <div className="summary-text">{p.summary}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Source · {p.jurisdiction}
                </div>
              </div>
              <div style={{ alignSelf: "center" }}>
                {p.source_url && (
                  <a href={p.source_url} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: "none" }}>
                    Source ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
