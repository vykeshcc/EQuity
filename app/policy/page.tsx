import Link from "next/link";
import { getDb } from "@/lib/db/client";

export const revalidate = 300;

export default async function PolicyPage() {
  const db = getDb();
  const { data } = await db
    .from("policy_items")
    .select("id,jurisdiction,status,title,summary,effective_date,source_url,peptide:peptides(slug,name)")
    .order("effective_date", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Policy & regulatory tracker</h1>
        <p className="text-sm text-slate-600">
          FDA, EMA, WADA, and DEA updates cross-referenced to peptides we track. Auto-ingested daily.
        </p>
      </header>
      <ul className="space-y-3">
        {(data ?? []).map((p: any) => (
          <li key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{p.jurisdiction}</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-900">{p.status}</span>
              {p.peptide && (
                <Link href={`/peptides/${p.peptide.slug}`} className="rounded bg-brand-50 px-2 py-0.5 text-brand-700 hover:underline">
                  {p.peptide.name}
                </Link>
              )}
              <span className="text-slate-500">{p.effective_date ?? "—"}</span>
            </div>
            {p.title ? <h3 className="mt-2 font-medium text-slate-900">{p.title}</h3> : null}
            <p className="mt-1 text-sm text-slate-700">{p.summary}</p>
            <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-brand-700 hover:underline">
              Source →
            </a>
          </li>
        ))}
        {!data?.length && <p className="text-sm text-slate-500">No policy items yet — first ingestion will populate this page.</p>}
      </ul>
    </div>
  );
}
