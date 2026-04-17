import Link from "next/link";
import { getDb } from "@/lib/db/client";

export const revalidate = 300;

export default async function HomePage() {
  const db = getDb();
  const [{ data: peptides }, { data: recent }, { data: policy }] = await Promise.all([
    db.from("peptides").select("slug,name,study_count,latest_year").order("study_count", { ascending: false }).limit(8),
    db.from("studies").select("id,title,year,journal,study_type,peptides:study_peptides(peptide:peptides(slug,name))").order("extracted_at", { ascending: false }).limit(6),
    db.from("policy_items").select("id,jurisdiction,status,summary,effective_date,peptide:peptides(slug,name)").order("effective_date", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          The research companion for peptide researchers.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Every current and past study on research-use peptides — extracted into standardized
          tables, ranked by evidence quality, and summarized by Claude. Updated daily from
          PubMed, ClinicalTrials.gov, bioRxiv, FDA, EMA, and WADA.
        </p>
        <form action="/search" className="flex max-w-xl gap-2 pt-2">
          <input
            name="q"
            placeholder="Search peptides, indications, outcomes…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Search
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Most-researched peptides</h2>
          <Link href="/peptides" className="text-sm text-brand-700 hover:underline">View all</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(peptides ?? []).map((p) => (
            <Link key={p.slug} href={`/peptides/${p.slug}`} className="rounded-lg border border-slate-200 p-4 hover:border-brand-500">
              <div className="font-medium">{p.name}</div>
              <div className="mt-1 text-xs text-slate-500">
                {p.study_count ?? 0} studies · latest {p.latest_year ?? "—"}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-semibold">Latest research</h2>
          <ul className="space-y-3">
            {(recent ?? []).map((s: any) => (
              <li key={s.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <Link href={`/studies/${s.id}`} className="font-medium hover:text-brand-700">
                  {s.title}
                </Link>
                <div className="mt-1 text-xs text-slate-500">
                  {s.journal ?? "—"} · {s.year ?? "—"} · {s.study_type ?? "—"}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-semibold">Policy updates</h2>
          <ul className="space-y-3">
            {(policy ?? []).map((p: any) => (
              <li key={p.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                    {p.jurisdiction}
                  </span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    {p.status}
                  </span>
                  {p.peptide && (
                    <Link href={`/peptides/${p.peptide.slug}`} className="text-xs text-brand-700 hover:underline">
                      {p.peptide.name}
                    </Link>
                  )}
                </div>
                <p className="mt-1 text-slate-700">{p.summary}</p>
                <div className="mt-1 text-xs text-slate-500">{p.effective_date}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
