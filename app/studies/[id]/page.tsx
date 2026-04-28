import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { StudyFactTable } from "@/components/StudyFactTable";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { CorrectionForm } from "@/components/CorrectionForm";
import { scoreBreakdown } from "@/lib/ranking/score";

export const revalidate = 300;

const CORRECTABLE_FIELDS = [
  "title",
  "year",
  "journal",
  "authors",
  "study_type",
  "species",
  "n_subjects",
  "design",
  "dose",
  "duration_days",
  "route",
  "primary_outcomes",
  "secondary_outcomes",
  "adverse_events",
  "risk_of_bias",
  "conclusion",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();

  const { data: study } = await db
    .from("studies")
    .select("*, study_peptides(peptide:peptides(slug,name))")
    .eq("id", id)
    .maybeSingle();
  if (!study) notFound();

  const breakdown = scoreBreakdown({
    study_type: study.study_type,
    species: study.species,
    n_subjects: study.n_subjects,
    year: study.year,
    risk_of_bias: study.risk_of_bias?.overall ?? null,
  });

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {(study.study_peptides ?? []).map((sp: any) => (
            <Link
              key={sp.peptide.slug}
              href={`/peptides/${sp.peptide.slug}`}
              className="rounded bg-brand-50 px-2 py-0.5 text-brand-700 hover:underline"
            >
              {sp.peptide.name}
            </Link>
          ))}
          <span>·</span>
          <span>{study.year ?? "—"}</span>
          <span>·</span>
          <span>{study.journal ?? "—"}</span>
        </div>
        <h1 className="max-w-4xl text-2xl font-semibold leading-snug">{study.title}</h1>
        {study.authors?.length ? (
          <p className="text-sm text-slate-600">{study.authors.slice(0, 8).join(", ")}{study.authors.length > 8 ? " …" : ""}</p>
        ) : null}
      </header>

      {study.highlights ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Highlights</h2>
            <FeedbackButtons targetType="highlight" targetId={study.id} />
          </div>
          {study.highlights.one_liner ? (
            <p className="text-slate-800">{study.highlights.one_liner}</p>
          ) : null}
          {Array.isArray(study.highlights.tldr) ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {study.highlights.tldr.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Standardized fact sheet</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Quality{" "}
              <strong className="text-slate-800">{breakdown.total}</strong>/100 · type {breakdown.components.type} · species {breakdown.components.species} · n {breakdown.components.n} · recency {breakdown.components.recency} · rob {breakdown.components.rob}
            </span>
            <FeedbackButtons targetType="extraction" targetId={study.id} />
          </div>
        </div>
        <StudyFactTable study={study as any} />
      </section>

      <section>
        <CorrectionForm targetType="study" targetId={study.id} fields={CORRECTABLE_FIELDS} />
      </section>

      <footer className="text-xs text-slate-400">
        Extracted {new Date(study.extracted_at).toLocaleDateString()} · {study.extraction_model} · prompt {study.extraction_version}
      </footer>
    </article>
  );
}
