"use client";

import { useState } from "react";

interface Props {
  targetType: "study" | "peptide" | "policy";
  targetId: string;
  fields: string[];
}

export function CorrectionForm({ targetType, targetId, fields }: Props) {
  const [field, setField] = useState(fields[0] ?? "");
  const [value, setValue] = useState("");
  const [rationale, setRationale] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "auth">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const r = await fetch("/api/contributions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          field,
          new_value: tryParse(value),
          rationale,
        }),
      });
      if (r.status === 401) {
        setStatus("auth");
        return;
      }
      setStatus(r.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  function tryParse(s: string): unknown {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold">Suggest a correction</h4>
      <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Correct value (JSON ok: e.g. 42 or {"overall":"low"})'
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>
      <textarea
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
        placeholder="Brief rationale + citation (optional)"
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        rows={2}
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Submit"}
        </button>
        {status === "sent" ? <span className="text-xs text-green-700">Submitted — pending review.</span> : null}
        {status === "auth" ? <span className="text-xs text-amber-700">Please sign in to contribute.</span> : null}
        {status === "error" ? <span className="text-xs text-red-700">Error. Try again.</span> : null}
      </div>
    </form>
  );
}
