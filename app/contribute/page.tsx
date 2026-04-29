"use client";

import React, { useState } from "react";
import { Crumb } from "@/components/shared";

type ExtractResult =
  | { ok: true; study_id: string; data: any }
  | { ok: false; error: string };

export default function ContributePage() {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [status, setStatus] = useState<"idle" | "extracting" | "done" | "error">("idle");
  const [result, setResult] = useState<ExtractResult | null>(null);

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (title.trim().length < 5 || abstract.trim().length < 10) return;
    setStatus("extracting");
    setResult(null);
    try {
      const r = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          abstract,
        }),
      });
      const j = (await r.json()) as ExtractResult;
      setResult(j);
      setStatus(j.ok ? "done" : "error");
    } catch (err: any) {
      setResult({ ok: false, error: err.message });
      setStatus("error");
    }
  }

  const tokenEstimate = Math.ceil((title.length + abstract.length) / 4);
  const costEstimate = ((title.length + abstract.length) * 0.000004).toFixed(4);

  return (
    <>
      <Crumb items={[{ label: "Sequence", href: "/" }, { label: "Contribute" }]} />
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 400, letterSpacing: "-0.025em", margin: "4px 0 8px", lineHeight: 1 }}>
        Add to the corpus
      </h1>
      <p style={{ color: "var(--ink-2)", margin: "0 0 24px", maxWidth: 640 }}>
        Paste a title + abstract (or a DOI), and Claude will extract a standardized fact sheet for review before it lands in the corpus.
        Your contribution is logged and feeds the eval golden set.
      </p>

      <div className="contrib-form">
        <form onSubmit={submit}>
          <div className="row-flex" style={{ marginBottom: 10 }}>
            <span className="facet active"><span className="k">Paste abstract</span></span>
            <span className="facet"><span className="k">DOI / PubMed ID</span></span>
            <span className="facet"><span className="k">Upload PDF</span></span>
          </div>
          
          <input
            placeholder="Title of the study"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", marginBottom: 8, padding: 12, border: "1px solid var(--line)", borderRadius: 6, fontFamily: "var(--sans)" }}
            required
          />

          <textarea
            placeholder={"Paste the full abstract text here..."}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            required
            rows={10}
            style={{ width: "100%", padding: 12, border: "1px solid var(--line)", borderRadius: 6, fontFamily: "var(--sans)", resize: "vertical" }}
          />

          <div className="row-flex" style={{ justifyContent: "space-between", marginTop: 12 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              {title.length + abstract.length} chars · est. {tokenEstimate} tokens · ~{costEstimate} USD
            </span>
            <button type="submit" className="btn primary" disabled={status === "extracting"}>
              {status === "extracting" ? "Extracting via Claude…" : "Extract →"}
            </button>
          </div>
        </form>

        <div className="contrib-preview">
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Live preview
          </div>
          {status !== "done" ? (
            <div className="placeholder" style={{ fontSize: 14, lineHeight: 1.55 }}>
              {status === "error" ? (
                <span style={{ color: "var(--danger-deep)" }}>Error: {result && !result.ok ? result.error : "Unknown"}</span>
              ) : status === "extracting" ? (
                "Streaming structured fields from Claude Sonnet 4.6 against extract.v1.4…"
              ) : (
                "Your standardized fact sheet will appear here. Every field is editable before save — corrections feed the eval golden set."
              )}
            </div>
          ) : (
            <div className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
              <div><span className="mono" style={{ color: "var(--ink-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</span><br/>Successfully ingested as {result?.ok && result.study_id.slice(0, 8)}</div>
              <div><span className="mono" style={{ color: "var(--ink-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Link</span><br/><a href={`/studies/${result?.ok && result.study_id}`}>View full study page →</a></div>
              
              <div style={{ marginTop: 16 }}>
                <span className="mono" style={{ color: "var(--ink-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Raw Data</span>
                <pre style={{ fontSize: 10, background: "var(--paper-2)", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 300 }}>
                  {JSON.stringify(result?.ok && result.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
