import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { RankedStudyList } from "@/components/RankedStudyList";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { Pagination } from "@/components/Pagination";

export const revalidate = 300;

const STUDY_PAGE_SIZE = 25;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ studyPage?: string }>;
}

export default async function PeptideDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { studyPage: studyPageParam } = await searchParams;
  const studyPage = Math.max(1, Number(studyPageParam ?? 1));
  const studyFrom = (studyPage - 1) * STUDY_PAGE_SIZE;
  const studyTo = studyFrom + STUDY_PAGE_SIZE - 1;
  const db = getDb();

  const { data: peptide } = await db
    .from("peptides")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!peptide) notFound();

  const [{ data: studies, count: studyCount }, { data: policy }, { data: summary }] = await Promise.all([
    db
      .from("studies")
      .select("id,title,year,journal,study_type,species,n_subjects,quality_score,highlights,study_peptides!inner(peptide_id)", { count: "exact" })
      .eq("study_peptides.peptide_id", peptide.id)
      .order("quality_score", { ascending: false })
      .range(studyFrom, studyTo),
    db
      .from("policy_items")
      .select("id,jurisdiction,status,title,summary,effective_date,source_url")
      .eq("peptide_id", peptide.id)
      .order("effective_date", { ascending: false }),
    db
      .from("peptide_evidence_summaries")
      .select("id,summary,citations,generated_at")
      .eq("peptide_id", peptide.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/peptides" className="hover:text-brand-700">Peptides</Link>
          <span>/</span>
          <span>{peptide.slug}</span>
        </div>
        <h1 className="text-3xl font-semibold">{peptide.name}</h1>
        {peptide.mechanism ? (
          <p className="max-w-3xl text-slate-700">{peptide.mechanism}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{peptide.category}</span>
          {(peptide.indications_tags ?? []).map((t: string) => (
            <span key={t} className="rounded bg-brand-50 px-2 py-0.5 text-brand-700">{t}</span>
          ))}
          {peptide.sequence ? (
            <span className="rounded bg-slate-50 px-2 py-0.5 font-mono text-slate-600">{peptide.sequence}</span>
          ) : null}
          {peptide.cas_number ? (
            <span className="rounded bg-slate-50 px-2 py-0.5 text-slate-600">CAS {peptide.cas_number}</span>
          ) : null}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Evidence summary</h2>
          {summary ? (
            <article className="prose prose-sm max-w-none rounded-lg border border-slate-200 bg-white p-4">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(summary.summary) }} />
              <FeedbackButtons targetType="summary" targetId={summary.id} className="mt-3" />
              <div className="mt-2 text-xs text-slate-400">
                Generated {new Date(summary.generated_at).toLocaleDateString()} — cites {(summary.citations ?? []).length} studies
              </div>
            </article>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Evidence summary will generate automatically once studies are ingested for this peptide.
            </p>
          )}
        </div>
        <aside>
          <h2 className="mb-3 text-lg font-semibold">Policy</h2>
          {(policy ?? []).length ? (
            <ul className="space-y-2">
              {(policy ?? []).map((p: any) => (
                <li key={p.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{p.jurisdiction}</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{p.status}</span>
                  </div>
                  <p className="mt-1 text-slate-700">{p.summary}</p>
                  <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-brand-700 hover:underline">
                    Source · {p.effective_date ?? "—"}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No policy flags recorded.</p>
          )}
        </aside>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Ranked studies</h2>
          <span className="text-xs text-slate-500">
            {studyCount ?? 0} total · sorted by composite quality score (0–100)
          </span>
        </div>
        <RankedStudyList studies={(studies ?? []) as any} />
        <Pagination
          page={studyPage}
          hasMore={studyFrom + STUDY_PAGE_SIZE < (studyCount ?? 0)}
          buildHref={(p) => `/peptides/${slug}?studyPage=${p}`}
        />
      </section>
    </div>
  );
}

function markdownToHtml(md: string): string {
  // Minimal markdown rendering — avoid a full MD library for now.
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(s-[a-f0-9]{8})\]/g, '<span class="rounded bg-brand-50 px-1 text-xs text-brand-700">$1</span>')
    .split(/\n{2,}/)
    .map((p) => (p.startsWith("<h") ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
    .join("\n");
}
