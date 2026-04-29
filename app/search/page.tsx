import { getDb } from "@/lib/db/client";
import { embed, toPgVector } from "@/lib/embeddings/embed";
import { SearchClient } from "./SearchClient";

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
          .select("id,title,one_liner,year,journal,study_type,species,n_subjects,quality_score,source,source_id,study_peptides!inner(peptide:peptides(slug,name))")
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
          .select("*")
          .or(`name.ilike.%${q}%,aliases.cs.{${q}}`)
          .limit(10),
      ]);
      studies = s ?? [];
      policy = p ?? [];
      peptides = pep ?? [];
    }
  }

  // Map studies returned from RPC or DB so it's consistent
  const mappedStudies = studies.map(s => {
    let peps = s.study_peptides;
    if (!peps && s.peptide) {
      peps = [{ peptide: s.peptide }];
    }
    return {
      ...s,
      quality: s.quality ?? s.quality_score,
      peptides: peps
    };
  });

  return (
    <SearchClient 
      initialQ={q} 
      initialMode={mode} 
      peptides={peptides} 
      studies={mappedStudies} 
    />
  );
}
