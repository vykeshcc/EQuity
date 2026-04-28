import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface StudyRow {
  id: string;
  title: string;
  year: number | null;
  journal: string | null;
  study_type: string | null;
  species: string | null;
  n_subjects: number | null;
  quality_score: number | null;
  highlights?: { one_liner?: string } | null;
}

export function RankedStudyList({ studies }: { studies: StudyRow[] }) {
  if (!studies.length) {
    return <p className="text-sm text-slate-500">No studies yet — ingestion in progress.</p>;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-14 px-3 py-2 text-left">Q</th>
            <th className="px-3 py-2 text-left">Study</th>
            <th className="w-28 px-3 py-2 text-left">Type</th>
            <th className="w-24 px-3 py-2 text-left">Species</th>
            <th className="w-16 px-3 py-2 text-right">N</th>
            <th className="w-20 px-3 py-2 text-right">Year</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {studies.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="px-3 py-2">
                <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold", qColor(s.quality_score))}>
                  {Math.round(s.quality_score ?? 0)}
                </span>
              </td>
              <td className="px-3 py-2">
                <Link href={`/studies/${s.id}`} className="font-medium hover:text-brand-700">
                  {s.title}
                </Link>
                {s.highlights?.one_liner ? (
                  <div className="mt-0.5 text-xs text-slate-500">{s.highlights.one_liner}</div>
                ) : null}
                <div className="mt-0.5 text-xs text-slate-400">{s.journal ?? "—"}</div>
              </td>
              <td className="px-3 py-2 text-slate-700">{s.study_type ?? "—"}</td>
              <td className="px-3 py-2 text-slate-700">{s.species ?? "—"}</td>
              <td className="px-3 py-2 text-right text-slate-700">{s.n_subjects ?? "—"}</td>
              <td className="px-3 py-2 text-right text-slate-700">{s.year ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function qColor(q: number | null): string {
  const v = q ?? 0;
  if (v >= 75) return "bg-green-100 text-green-900";
  if (v >= 55) return "bg-brand-100 text-brand-900";
  if (v >= 35) return "bg-amber-100 text-amber-900";
  return "bg-slate-100 text-slate-600";
}
