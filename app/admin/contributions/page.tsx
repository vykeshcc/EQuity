import Link from "next/link";
import { getAdminDb } from "@/lib/db/client";
import { ReviewButtons } from "./ReviewButtons";

export const dynamic = "force-dynamic";

const TARGET_HREF: Record<string, (id: string) => string> = {
  study: (id) => `/studies/${id}`,
  peptide: (id) => `/peptides/${id}`,
  policy: (id) => `/policy`,
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-green-100 text-green-800",
  merged: "bg-brand-100 text-brand-800",
  rejected: "bg-red-100 text-red-800",
};

export default async function ContributionsPage() {
  const db = getAdminDb();
  const { data: rows } = await db
    .from("contributions")
    .select("id,target_type,target_id,field,old_value,new_value,rationale,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const contributions = rows ?? [];
  const pending = contributions.filter((c) => c.status === "pending");
  const resolved = contributions.filter((c) => c.status !== "pending");

  function renderSection(items: typeof contributions, title: string) {
    return (
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title} ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">None.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Target</th>
                  <th className="px-3 py-2 text-left">Field</th>
                  <th className="px-3 py-2 text-left">Old</th>
                  <th className="px-3 py-2 text-left">New</th>
                  <th className="px-3 py-2 text-left">Rationale</th>
                  <th className="w-32 px-3 py-2 text-left">Status</th>
                  <th className="w-40 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((c: any) => {
                  const href = TARGET_HREF[c.target_type]?.(c.target_id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 align-top">
                      <td className="px-3 py-2">
                        <div className="text-xs text-slate-500">{c.target_type}</div>
                        {href ? (
                          <Link href={href} className="font-mono text-xs text-brand-700 hover:underline">
                            {c.target_id.slice(0, 8)}
                          </Link>
                        ) : (
                          <span className="font-mono text-xs">{c.target_id.slice(0, 8)}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-700">{c.field}</td>
                      <td className="max-w-[140px] px-3 py-2 text-xs text-slate-500">
                        <pre className="overflow-auto whitespace-pre-wrap">
                          {c.old_value != null ? JSON.stringify(c.old_value, null, 2) : <span className="italic">—</span>}
                        </pre>
                      </td>
                      <td className="max-w-[140px] px-3 py-2 text-xs text-slate-800">
                        <pre className="overflow-auto whitespace-pre-wrap font-semibold">
                          {JSON.stringify(c.new_value, null, 2)}
                        </pre>
                      </td>
                      <td className="max-w-[200px] px-3 py-2 text-xs text-slate-600">
                        {c.rationale ?? <span className="italic text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status] ?? ""}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {c.status === "pending" && (
                          <ReviewButtons
                            id={c.id}
                            targetType={c.target_type}
                            targetId={c.target_id}
                            field={c.field}
                            newValue={c.new_value}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Corrections review</h1>
          <p className="text-sm text-slate-600">
            Field-level corrections submitted by contributors. Approving applies the change immediately.
          </p>
        </div>
        <Link href="/admin/evals" className="text-sm text-brand-700 hover:underline">← Evals</Link>
      </header>

      {renderSection(pending, "Pending")}
      {renderSection(resolved, "Resolved")}
    </div>
  );
}
