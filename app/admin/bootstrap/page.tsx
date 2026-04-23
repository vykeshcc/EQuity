"use client";

import { useState } from "react";

type JobStatus = "idle" | "running" | "done" | "error";

interface JobResult {
  ok: boolean;
  peptides?: number;
  results?: Record<string, any[]>;
  policy?: { fda: any; wada: any };
  error?: string;
}

function summarize(results: Record<string, any[]>): string {
  return Object.entries(results)
    .map(([src, arr]) => {
      const newStudies = arr.reduce((s, r) => s + (r.newStudies ?? 0), 0);
      const errors = arr.reduce((s, r) => s + (r.errors?.length ?? 0), 0);
      return `${src}: ${newStudies} new${errors ? `, ${errors} errors` : ""}`;
    })
    .join(" · ");
}

export default function BootstrapPage() {
  const [peptide, setPeptide] = useState("");
  const [cronSecret, setCronSecret] = useState("");
  const [status, setStatus] = useState<JobStatus>("idle");
  const [result, setResult] = useState<JobResult | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setStatus("running");
    setResult(null);
    try {
      const params = new URLSearchParams();
      if (peptide) params.set("peptide", peptide);
      const headers: Record<string, string> = {};
      if (cronSecret) headers["x-cron-secret"] = cronSecret;
      const r = await fetch(`/api/ingest/backfill?${params.toString()}`, { method: "GET", headers });
      const j = await r.json();
      setResult(j);
      setStatus(j.ok ? "done" : "error");
    } catch (err: any) {
      setResult({ ok: false, error: err.message });
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Bootstrap research corpus</h1>
        <p className="text-sm text-slate-600">
          Trigger a one-time full historical pull across PubMed, ClinicalTrials.gov, bioRxiv, FDA, and WADA.
          Run this once after first deployment to seed the database.
        </p>
      </header>

      <form onSubmit={run} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Peptide slug (optional — leave blank for all peptides)
            </label>
            <input
              value={peptide}
              onChange={(e) => setPeptide(e.target.value)}
              placeholder="e.g. bpc-157"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              CRON_SECRET (if set in env)
            </label>
            <input
              value={cronSecret}
              onChange={(e) => setCronSecret(e.target.value)}
              placeholder="your CRON_SECRET value"
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 border border-amber-200">
          This job runs synchronously and may take several minutes for a full corpus pull.
          Each peptide pulls up to 25 studies from PubMed and ClinicalTrials.gov and 10 years from bioRxiv.
        </p>

        <button
          type="submit"
          disabled={status === "running"}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {status === "running" ? "Running backfill…" : "Start backfill"}
        </button>
      </form>

      {result && !result.ok ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      ) : null}

      {result && result.ok ? (
        <div className="space-y-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-semibold">Backfill complete — {result.peptides} peptide(s) processed.</p>
          {result.results && (
            <p className="font-mono text-xs">{summarize(result.results)}</p>
          )}
          {result.policy && (
            <p className="text-xs">
              Policy: FDA checked {result.policy.fda?.checked ?? 0}, added {result.policy.fda?.added ?? 0} ·
              WADA added {result.policy.wada?.added ?? 0}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
