import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { embed, toPgVector } from "@/lib/embeddings/embed";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; mode?: "keyword" | "semantic" }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", mode = "keyword" } = await searchParams;
  const db = getDb();

  let studies: any[] = [];
  let policy: any[] = [];
  let peptides: any[] = [];

  if (q.trim().length >= 2) {
    if (mode === "semantic" && process.env.GOOGLE_API_KEY) {
      try {
        const [v] = await embed([q]);
        const { data } = await db.rpc("match_studies", { query_embedding: toPgVector(v), match_count: 40 });
        studies = data ?? [];
      } catch {
        studies = [];
      }
    } else {
      const [{ data: s }, { data: p }, { data: pep }] = await Promise.all([
        db
          .from("studies")
          .select("id,title,year,journal,study_type,species,n_subjects,quality_score")
          .or(`title.ilike.%${q}%,conclusion.ilike.%${q}%`)
          .order("quality_score", { ascending: false })
          .limit(40),
        db
          .from("policy_items")
          .select("id,jurisdiction,status,summary,source_url,effective_date,peptide:peptides(slug,name)")
          .or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
          .limit(10),
        db
          .from("peptides")
          .select("slug,name,mechanism,study_count")
          .or(`name.ilike.%${q}%,aliases.cs.{${q}}`)
          .limit(10),
      ]);
      studies = s ?? [];
      policy = p ?? [];
      peptides = pep ?? [];
    }
  }

  return (
    <div className="space-y-6">
      <form className="flex max-w-2xl items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search peptides, conditions, outcomes…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          name="mode"
          defaultValue={mode}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="keyword">Keyword</option>
          <option value="semantic">Semantic</option>
        </select>
        <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">Search</button>
      </form>

      {q && (
        <>
          {peptides.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Peptides</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {peptides.map((p: any) => (
                  <li key={p.slug} className="rounded border border-slate-200 p-3">
                    <Link href={`/peptides/${p.slug}`} className="font-medium hover:text-brand-700">{p.name}</Link>
                    {p.mechanism ? <div className="mt-0.5 text-xs text-slate-500">{p.mechanism}</div> : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Studies ({studies.length})
            </h2>
            <ul className="space-y-2">
              {studies.map((s: any) => (
                <li key={s.id} className="rounded border border-slate-200 p-3 text-sm">
                  <Link href={`/studies/${s.id}`} className="font-medium hover:text-brand-700">{s.title}</Link>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Q {Math.round(s.quality_score ?? 0)} · {s.study_type ?? "—"} · {s.species ?? "—"} · n={s.n_subjects ?? "—"} · {s.year ?? "—"} · {s.journal ?? "—"}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {policy.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Policy</h2>
              <ul className="space-y-2">
                {policy.map((p: any) => (
                  <li key={p.id} className="rounded border border-slate-200 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{p.jurisdiction}</span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{p.status}</span>
                      {p.peptide && (
                        <Link href={`/peptides/${p.peptide.slug}`} className="text-xs text-brand-700 hover:underline">
                          {p.peptide.name}
                        </Link>
                      )}
                    </div>
                    <p className="mt-1 text-slate-700">{p.summary}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
