import { getDb } from "@/lib/db/client";
import { PeptideCard } from "@/components/PeptideCard";
import { Pagination } from "@/components/Pagination";

export const revalidate = 300;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PeptidesIndex({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const db = getDb();
  const { data: peptides, count } = await db
    .from("peptides")
    .select("slug,name,category,mechanism,indications_tags,study_count,latest_year,legal_status", { count: "exact" })
    .order("study_count", { ascending: false })
    .range(from, to);

  const total = count ?? 0;
  const hasMore = to < total - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Peptides</h1>
          <p className="text-sm text-slate-600">
            {total} peptides tracked · studies ingested daily from PubMed, ClinicalTrials.gov, bioRxiv.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(peptides ?? []).map((p) => (
          <PeptideCard key={p.slug} peptide={p as any} />
        ))}
      </div>
      <Pagination
        page={page}
        hasMore={hasMore}
        buildHref={(p) => `/peptides?page=${p}`}
      />
    </div>
  );
}
