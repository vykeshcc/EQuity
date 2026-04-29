"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Crumb, QChip } from "@/components/shared";

function Highlight({ text, q }: { text: string; q?: string }) {
  if (!q || q.length < 2) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "var(--accent-tint)", color: "inherit", padding: "0 2px", borderRadius: 2 }}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function SearchClient({ initialQ, initialMode, peptides, studies }: { initialQ: string; initialMode: string; peptides: any[]; studies: any[] }) {
  const [q, setQ] = useState(initialQ);
  const [mode, setMode] = useState(initialMode);

  return (
    <>
      <Crumb items={[{ label: "Sequence", href: "/" }, { label: "Search" }]} />
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 400, letterSpacing: "-0.025em", margin: "4px 0 24px", lineHeight: 1 }}>
        Search the corpus
      </h1>

      <form action="/search" className="search-megabar" style={{ maxWidth: 760, marginBottom: 24 }}>
        <input type="hidden" name="mode" value={mode} />
        <div className="mode">
          <button type="button" className={mode === "keyword" ? "on" : ""} onClick={() => setMode("keyword")}>Keyword</button>
          <button type="button" className={mode === "semantic" ? "on" : ""} onClick={() => setMode("semantic")}>Semantic</button>
        </div>
        <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search studies, indications, outcomes…" />
        <button type="submit" className="go">Search →</button>
      </form>

      <div className="filter-bar">
        <span className="eyebrow" style={{ alignSelf: "center", marginRight: 4 }}>Filter</span>
        <span className="facet active"><span className="k">All types</span></span>
        <span className="facet"><span className="k">RCT</span></span>
        <span className="facet"><span className="k">Cohort</span></span>
        <span className="facet"><span className="k">Animal</span></span>
        <span className="facet"><span className="k">Review/Meta</span></span>
        <span className="facet"><span className="k">In-vitro</span></span>
        <span style={{ width: 12 }} />
        <span className="facet"><span className="k">Human only</span></span>
        <span className="facet"><span className="k">Q ≥ 70</span></span>
        <span className="facet"><span className="k">Last 3 yrs</span></span>
      </div>

      {peptides.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div className="section-h"><h2>Peptides</h2><span className="meta">{peptides.length} MATCHES</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {peptides.slice(0, 4).map((p: any) => (
              <Link key={p.slug} href={`/peptides/${p.slug}`} className="card" style={{ padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 2 }}><Highlight text={p.name} q={initialQ} /></div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{p.indications_tags ? p.indications_tags.join(" · ") : (p.top_indication || "")}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "right" }}>
                  {p.study_count} studies<br/>{Math.round((p.study_count||0)*0.14)} human
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {studies.length > 0 && (
        <section>
          <div className="section-h"><h2>Studies</h2><span className="meta">{studies.length} MATCHES · SORTED BY Q</span></div>
          <div className="study-list">
            {studies.map((s: any) => (
              <Link key={s.id} href={`/studies/${s.id}`} className="study-row">
                <QChip q={s.quality ?? s.quality_score ?? 50} />
                <div>
                  <div className="title"><Highlight text={s.title} q={initialQ} /></div>
                  <div className="one-liner">{s.one_liner || s.title}</div>
                  <div className="meta-line">
                    {s.peptides?.[0]?.peptide?.name && <span>{s.peptides[0].peptide.name}</span>}
                    {s.peptide?.name && <span>{s.peptide.name}</span>}
                    <span className="sep">·</span>
                    <span>{s.journal}</span><span className="sep">·</span>
                    <span>{s.year}</span><span className="sep">·</span>
                    <span>{s.study_type}</span><span className="sep">·</span>
                    <span>{s.species}</span>
                    {s.n_subjects && <><span className="sep">·</span><span>n = {s.n_subjects.toLocaleString()}</span></>}
                  </div>
                </div>
                <div className="right">{s.source}<br/>{s.source_id}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {initialQ.length >= 2 && studies.length === 0 && peptides.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-2)" }}>
          No matches found for "{initialQ}". Try adjusting your keywords.
        </div>
      )}
    </>
  );
}
