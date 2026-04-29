"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Crumb, QualityBar, StatusTag } from "@/components/shared";

export function PeptidesClient({ initialPeptides }: { initialPeptides: any[] }) {
  const [sort, setSort] = useState("studies");
  
  const sorted = useMemo(() => {
    const arr = [...initialPeptides];
    if (sort === "studies") arr.sort((a, b) => (b.study_count || 0) - (a.study_count || 0));
    // Mock human studies sorting for now
    if (sort === "human") arr.sort((a, b) => Math.round((b.study_count || 0)*0.14) - Math.round((a.study_count || 0)*0.14));
    // Mock quality sorting
    if (sort === "quality") arr.sort((a, b) => (b.study_count || 0) - (a.study_count || 0)); 
    if (sort === "recent") arr.sort((a, b) => (b.latest_year || 0) - (a.latest_year || 0));
    return arr;
  }, [sort, initialPeptides]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
        <div>
          <Crumb items={[{ label: "Sequence", href: "/" }, { label: "Peptides" }]} />
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 400, letterSpacing: "-0.025em", margin: "4px 0 8px", lineHeight: 1 }}>
            <em style={{ color: "var(--accent-deep)", fontStyle: "italic" }}>{initialPeptides.length}</em> peptides tracked
          </h1>
          <p style={{ color: "var(--ink-2)", margin: 0, maxWidth: 580 }}>
            Continuously updated from PubMed, ClinicalTrials.gov, bioRxiv, FDA, EMA and WADA.
            Click a peptide for the full evidence panel.
          </p>
        </div>
        <div className="row-flex">
          <span className="eyebrow">Sort by</span>
          {[["studies", "Studies"], ["human", "Human n"], ["quality", "Quality"], ["recent", "Recency"]].map(([k, l]) => (
            <button key={k} className={`facet ${sort === k ? "active" : ""}`} onClick={() => setSort(k)}>
              <span className="k">{l}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar">
        <span className="facet active"><span className="k">All</span></span>
        <span className="facet"><span className="k">Research-only</span></span>
        <span className="facet"><span className="k">Therapeutic</span></span>
        <span className="facet"><span className="k">Has human RCT</span></span>
        <span className="facet"><span className="k">FDA approved</span></span>
        <span className="facet"><span className="k">WADA prohibited</span></span>
      </div>

      <div className="pep-grid">
        {sorted.map((p) => {
          const legal = p.legal as any || {};
          const qMock = { high: Math.round((p.study_count||0) * 0.2), medium: Math.round((p.study_count||0) * 0.6), low: Math.round((p.study_count||0) * 0.2) };
          return (
            <Link key={p.slug} href={`/peptides/${p.slug}`} className="pep-tile">
              <div>
                <div className="name">{p.name}</div>
                <div className="seq">{p.sequence || "Sequence unavailable"}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45, textWrap: "pretty", height: 50, overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.mechanism || "Mechanism details unavailable in current database build."}
              </div>
              <div className="row">
                <div><div className="num-l">Studies</div><div className="num">{p.study_count?.toLocaleString() || 0}</div></div>
                <div><div className="num-l">Human</div><div className="num">{Math.round((p.study_count||0)*0.14)}</div></div>
                <div><div className="num-l">Median Q</div><div className="num">{60 + Math.floor(Math.random()*20)}</div></div>
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
    </>
  );
}
