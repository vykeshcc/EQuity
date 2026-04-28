import { getDb } from "@/lib/db/client";
import { PeptideCard } from "@/components/PeptideCard";

export const revalidate = 300;

export default async function PeptidesIndex() {
  const db = getDb();
  const { data: peptides } = await db
    .from("peptides")
    .select("slug,name,category,mechanism,indications_tags,study_count,latest_year,legal_status")
    .order("study_count", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Peptides</h1>
          <p className="text-sm text-slate-600">
            {(peptides ?? []).length} peptides tracked · studies ingested daily from PubMed, ClinicalTrials.gov, bioRxiv.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(peptides ?? []).map((p) => (
          <PeptideCard key={p.slug} peptide={p as any} />
        ))}
      </div>
    </div>
  );
}
