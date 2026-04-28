"use client";

import { useState } from "react";

type ExtractResult =
  | { ok: true; study_id: string; data: any }
  | { ok: false; error: string };

export default function ContributePage() {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [doi, setDoi] = useState("");
  const [journal, setJournal] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState<"idle" | "extracting" | "done" | "error">("idle");
  const [result, setResult] = useState<ExtractResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("extracting");
    setResult(null);
    try {
      const r = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          abstract,
          doi: doi || null,
          journal: journal || null,
          year: year ? Number(year) : null,
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Contribute a study</h1>
        <p className="text-sm text-slate-600">
          Paste a title + abstract (or DOI). Claude extracts the standardized fact sheet;
          you review and publish.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Study title"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            placeholder="DOI (optional)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Journal (optional)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            type="number"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <textarea
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Paste the abstract (or full text) here…"
          required
          rows={10}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "extracting"}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {status === "extracting" ? "Extracting with Claude…" : "Extract & save"}
        </button>
      </form>

      {result && !result.ok ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      ) : null}

      {result && result.ok ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          Saved as study <a className="font-medium underline" href={`/studies/${result.study_id}`}>{result.study_id.slice(0, 8)}</a>.
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-green-800">Extracted JSON</summary>
            <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs text-slate-800">{JSON.stringify(result.data, null, 2)}</pre>
          </details>
        </div>
      ) : null}
    </div>
  );
}
