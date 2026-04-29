"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sparkline({ values, color = "var(--accent)", height = 28, width = 120 }: { values: number[]; color?: string; height?: number; width?: number }) {
  if (!values || !values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const w = width;
  const h = height;
  const stepX = w / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const path = `M ${points.join(" L ")}`;
  const area = `${path} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={area} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={(values.length - 1) * stepX} cy={h - ((values[values.length - 1] - min) / span) * (h - 4) - 2} r="2.5" fill={color} />
    </svg>
  );
}

export function QualityBar({ q }: { q: { high: number; medium: number; low: number } }) {
  const total = q.high + q.medium + q.low;
  if (total === 0) return <div className="qbar"><span style={{ width: "0%" }} /><span style={{ width: "0%" }} /><span style={{ width: "100%" }} /></div>;
  const hi = (q.high / total) * 100;
  const md = (q.medium / total) * 100;
  const lo = (q.low / total) * 100;
  return (
    <div className="qbar" title={`${q.high} high · ${q.medium} medium · ${q.low} low`}>
      <span style={{ width: hi + "%" }} />
      <span style={{ width: md + "%" }} />
      <span style={{ width: lo + "%" }} />
    </div>
  );
}

export function QChip({ q }: { q: number }) {
  let cls = "q-low";
  if (q >= 75) cls = "q-high";
  else if (q >= 50) cls = "q-mid";
  return <div className={`q-chip ${cls}`}>{Math.round(q)}</div>;
}

export function StatusTag({ status }: { status?: string | null }) {
  if (!status) return null;
  const map: Record<string, [string, string]> = {
    "approved": ["accent", "Approved"],
    "Rx": ["accent", "Rx"],
    "cosmetic-OTC": ["accent", "OTC"],
    "monitored": ["warn", "Monitored"],
    "warning-letter": ["warn", "Warning"],
    "prohibited": ["danger", "Prohibited"],
    "not-approved": ["", "Not approved"],
    "research-use": ["", "Research"],
    "not-listed": ["", "Not listed"],
  };
  const [cls, label] = map[status] || ["", status];
  return <span className={`tag ${cls}`}>{label}</span>;
}

export function Topbar() {
  const pathname = usePathname();
  const items = [
    ["/", "Overview"],
    ["/peptides", "Peptides"],
    ["/search", "Search"],
    ["/policy", "Policy"],
    ["/contribute", "Contribute"],
  ];
  
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          <span><span className="dot" />Sequence</span>
          <span className="slash">/</span>
          <span className="sub">Peptide Evidence</span>
        </Link>
        <nav className="nav">
          {items.map(([path, label]) => (
            <Link key={path} href={path} className={isActive(path) ? "active" : ""}>
              <button className={isActive(path) ? "active" : ""}>{label}</button>
            </Link>
          ))}
        </nav>
        <div className="topbar-right">
          <Link href="/search">
            <div className="kbar" role="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <span>Search the corpus…</span>
              <span className="kbd">⌘K</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Crumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="crumb">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span>{it.label}</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export function SummaryBlock({ text }: { text: string }) {
  const html = useMemo(() => {
    if (!text) return [];
    const lines = text.split(/\n\n+/);
    return lines.map((block) => {
      if (block.startsWith("## ")) return { type: "h2", text: block.slice(3) };
      if (block.startsWith("### ")) return { type: "h3", text: block.slice(4) };
      return { type: "p", text: block };
    });
  }, [text]);

  function renderInline(s: string) {
    const parts: React.ReactNode[] = [];
    let rest = s;
    let key = 0;
    while (rest.length > 0) {
      const cite = rest.match(/\[([sp]-[a-f0-9\-]+)\]/);
      const bold = rest.match(/\*\*(.+?)\*\*/);
      const next = [cite, bold].filter(Boolean).sort((a, b) => a!.index! - b!.index!)[0];
      if (!next) { parts.push(rest); break; }
      parts.push(rest.slice(0, next.index));
      if (next === cite) {
        const id = next[1];
        parts.push(
          <Link key={key++} href={id.startsWith('p-') ? `/policy` : `/studies/${id}`} className="cite">
            {id}
          </Link>
        );
      } else {
        parts.push(<strong key={key++}>{next[1]}</strong>);
      }
      rest = rest.slice((next.index || 0) + next[0].length);
    }
    return parts;
  }

  return (
    <div className="summary">
      {html.map((b, i) => {
        if (b.type === "h2") return null;
        if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
        return <p key={i}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}
