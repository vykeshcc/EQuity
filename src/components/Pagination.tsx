import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface Props {
  page: number;
  hasMore: boolean;
  buildHref: (page: number) => string;
}

export function Pagination({ page, hasMore, buildHref }: Props) {
  if (page === 1 && !hasMore) return null;
  return (
    <div className="flex items-center justify-between pt-4 text-sm">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 hover:border-brand-500 hover:text-brand-700">
          ← Previous
        </Link>
      ) : <span />}
      <span className="text-slate-500">Page {page}</span>
      {hasMore ? (
        <Link href={buildHref(page + 1)} className={cn("rounded-md border border-slate-200 px-3 py-1.5 hover:border-brand-500 hover:text-brand-700")}>
          Next →
        </Link>
      ) : <span />}
    </div>
  );
}
