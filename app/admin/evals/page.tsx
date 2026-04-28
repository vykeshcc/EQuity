import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function EvalDashboard() {
  const db = getDb();
  const [{ data: cases }, { data: results }] = await Promise.all([
    db.from("eval_cases").select("id,name,source,created_at").order("created_at", { ascending: false }),
    db
      .from("eval_results")
      .select("id,case_id,model,prompt_version,passed,field_scores,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const byPrompt = new Map<string, { pass: number; total: number }>();
  for (const r of results ?? []) {
    const k = `${r.prompt_version} / ${r.model}`;
    const cur = byPrompt.get(k) ?? { pass: 0, total: 0 };
    cur.total++;
    if (r.passed) cur.pass++;
    byPrompt.set(k, cur);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Eval dashboard</h1>
        <p className="text-sm text-slate-600">
          Golden-set extraction accuracy across prompt versions and Claude models.
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Pass rates</h2>
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
