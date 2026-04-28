import Link from "next/link";

interface PeptideCardProps {
  peptide: {
    slug: string;
    name: string;
    mechanism?: string | null;
    category?: string | null;
    indications_tags?: string[] | null;
    study_count?: number | null;
    latest_year?: number | null;
    legal_status?: Record<string, string> | null;
  };
}

export function PeptideCard({ peptide }: PeptideCardProps) {
  const policyBadges = peptide.legal_status
    ? Object.entries(peptide.legal_status).slice(0, 3)
    : [];
  return (
    <Link
      href={`/peptides/${peptide.slug}`}
      className="flex flex-col rounded-lg border border-slate-200 p-4 transition hover:border-brand-500 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-slate-900">{peptide.name}</h3>
          {peptide.mechanism ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{peptide.mechanism}</p>
          ) : null}
        </div>
        {peptide.category ? (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
            {peptide.category}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {(peptide.indications_tags ?? []).slice(0, 4).map((t) => (
          <span key={t} className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between pt-3 text-xs text-slate-500">
        <span>
          {peptide.study_count ?? 0} studies · latest {peptide.latest_year ?? "—"}
        </span>
        <span className="flex gap-1">
          {policyBadges.map(([j, v]) => (
            <span key={j} className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-800" title={`${j}: ${v}`}>
              {j}
            </span>
          ))}
        </span>
      </div>
    </Link>
  );
}
