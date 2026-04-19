import Link from "next/link";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function EvalDashboard() {
  const db = getDb();
  const [{ data: cases }, { data: results }] = await Promise.all([
    db.from("eval_cases").select("id,name,source,created_at").order("created_at", { ascending: false }),
    db
      .from("eval_results")
      .select("id,case_id,model,prompt_version,passed,field_scores,diff,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  // Pass rates per prompt/model version.
  const byPrompt = new Map<string, { pass: number; total: number }>();
  // Field-level pass rates across all runs (most recent prompt version only).
  const fieldTotals = new Map<string, { pass: number; total: number }>();

  for (const r of results ?? []) {
    const k = `${r.prompt_version} / ${r.model}`;
    const cur = byPrompt.get(k) ?? { pass: 0, total: 0 };
    cur.total++;
    if (r.passed) cur.pass++;
    byPrompt.set(k, cur);

    for (const [field, passed] of Object.entries((r.field_scores as Record<string, boolean>) ?? {})) {
      const fc = fieldTotals.get(field) ?? { pass: 0, total: 0 };
      fc.total++;
      if (passed) fc.pass++;
      fieldTotals.set(field, fc);
    }
  }

  // Sort fields worst→best so problem areas surface first.
  const sortedFields = [...fieldTotals.entries()].sort(
    ([, a], [, b]) => a.pass / Math.max(1, a.total) - b.pass / Math.max(1, b.total),
  );

  const caseById = new Map((cases ?? []).map((c: any) => [c.id, c]));

  // Most recent failing results (for diff drill-down).
  const failures = (results ?? []).filter((r: any) => !r.passed).slice(0, 20);

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Eval dashboard</h1>
          <p className="text-sm text-slate-600">
            Golden-set extraction accuracy across prompt versions and Claude models.
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/admin/contributions" className="text-brand-700 hover:underline">Corrections →</Link>
          <Link href="/admin/feedback" className="text-brand-700 hover:underline">Feedback →</Link>
        </div>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Pass rates by version</h2>
        <table className="min-w-full divide-y divide-slate-200 rounded-lg border border-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Prompt / Model</th>
              <th className="px-3 py-2 text-right">Passed</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...byPrompt.entries()].map(([k, v]) => (
              <tr key={k}>
                <td className="px-3 py-2 font-mono text-xs">{k}</td>
                <td className="px-3 py-2 text-right">{v.pass}</td>
                <td className="px-3 py-2 text-right">{v.total}</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {((v.pass / Math.max(1, v.total)) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {sortedFields.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Field accuracy (worst first)
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Field</th>
                  <th className="px-3 py-2 text-right">Pass</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="w-48 px-3 py-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedFields.map(([field, v]) => {
                  const rate = v.pass / Math.max(1, v.total);
                  const color = rate >= 0.9 ? "text-green-700" : rate >= 0.7 ? "text-amber-700" : "text-red-700";
                  return (
                    <tr key={field}>
                      <td className="px-3 py-2 font-mono text-xs">{field}</td>
                      <td className="px-3 py-2 text-right text-xs">{v.pass}</td>
                      <td className="px-3 py-2 text-right text-xs">{v.total}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={`font-semibold text-xs ${color}`}>
                          {(rate * 100).toFixed(0)}%
                        </span>
                        <div className="ml-auto mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${rate >= 0.9 ? "bg-green-500" : rate >= 0.7 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${rate * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {failures.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent failures — field diffs
          </h2>
          <div className="space-y-3">
            {failures.map((r: any) => {
              const c = caseById.get(r.case_id);
              const failedFields = Object.entries((r.field_scores as Record<string, boolean>) ?? {})
                .filter(([, v]) => !v)
                .map(([k]) => k);
              return (
                <details key={r.id} className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-red-900">
                    {c?.name ?? r.case_id.slice(0, 8)} — failed: {failedFields.join(", ")}
                  </summary>
                  {r.diff && (
                    <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs text-slate-700">
                      {JSON.stringify(r.diff, null, 2)}
                    </pre>
                  )}
                </details>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Cases ({(cases ?? []).length})
        </h2>
        <ul className="space-y-1 text-sm">
          {(cases ?? []).map((c: any) => (
            <li key={c.id} className="rounded border border-slate-200 bg-white px-3 py-2">
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-xs text-slate-500">source: {c.source ?? "?"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
