import Link from "next/link";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const TARGET_LABELS: Record<string, string> = {
  highlight: "Highlight",
  extraction: "Extraction",
  summary: "Summary",
  ranking: "Ranking",
};

const TARGET_HREF: Record<string, (id: string) => string> = {
  highlight: (id) => `/studies/${id}`,
  extraction: (id) => `/studies/${id}`,
  summary: (id) => `/peptides/${id}`,
  ranking: (id) => `/studies/${id}`,
};

export default async function FeedbackPage() {
  const db = getDb();

  const { data: rows } = await db
    .from("feedback")
    .select("id,target_type,target_id,rating,comment,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const feedback = rows ?? [];

  // Aggregate by target_type
  const byType = new Map<string, { up: number; down: number }>();
  for (const r of feedback) {
    const key = r.target_type as string;
    const cur = byType.get(key) ?? { up: 0, down: 0 };
    if (r.rating === 1) cur.up++;
    else cur.down++;
    byType.set(key, cur);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Feedback review</h1>
        <p className="text-sm text-slate-600">
          Thumbs up/down from users across highlights, extractions, and summaries.
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Summary by type</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[...byType.entries()].map(([type, counts]) => {
            const total = counts.up + counts.down;
            const pct = total ? Math.round((counts.up / total) * 100) : 0;
            return (
              <div key={type} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {TARGET_LABELS[type] ?? type}
                </div>
                <div className="mt-1 text-2xl font-semibold">{pct}%</div>
                <div className="mt-0.5 text-xs text-slate-500">positive · {total} ratings</div>
                <div className="mt-1 flex gap-2 text-xs">
                  <span className="text-green-700">↑ {counts.up}</span>
                  <span className="text-red-600">↓ {counts.down}</span>
                </div>
              </div>
            );
          })}
          {byType.size === 0 && (
            <p className="col-span-4 text-sm text-slate-500">No feedback recorded yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent feedback ({feedback.length})
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-8 px-3 py-2 text-left">Rating</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Target</th>
                <th className="px-3 py-2 text-left">Comment</th>
                <th className="w-32 px-3 py-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {feedback.map((r: any) => {
                const href = TARGET_HREF[r.target_type]?.(r.target_id);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <span className={r.rating === 1 ? "text-green-700" : "text-red-600"}>
                        {r.rating === 1 ? "↑" : "↓"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {TARGET_LABELS[r.target_type] ?? r.target_type}
                    </td>
                    <td className="px-3 py-2">
                      {href ? (
                        <Link href={href} className="font-mono text-xs text-brand-700 hover:underline">
                          {r.target_id.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs">{r.target_id.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.comment ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2 text-right text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {feedback.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                    No feedback yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="text-xs text-slate-400">
        <Link href="/admin/evals" className="hover:text-brand-700">← Back to evals</Link>
      </div>
    </div>
  );
}
