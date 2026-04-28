import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { embed, toPgVector } from "@/lib/embeddings/embed";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const mode = url.searchParams.get("mode") ?? "keyword";
  if (q.length < 2) return NextResponse.json({ studies: [], policy: [], peptides: [] });

  const db = getDb();

  if (mode === "semantic" && process.env.GOOGLE_API_KEY) {
    const [vec] = await embed([q]);
    const { data, error } = await db.rpc("match_studies", {
      query_embedding: toPgVector(vec),
      match_count: 40,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ studies: data ?? [], policy: [], peptides: [] });
  }

  const [{ data: studies }, { data: policy }, { data: peptides }] = await Promise.all([
    db
      .from("studies")
      .select("id,title,year,journal,study_type,species,n_subjects,quality_score")
      .or(`title.ilike.%${q}%,conclusion.ilike.%${q}%`)
      .order("quality_score", { ascending: false })
      .limit(40),
    db
      .from("policy_items")
      .select("id,jurisdiction,status,summary,peptide:peptides(slug,name)")
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
      .limit(10),
    db
      .from("peptides")
      .select("slug,name,mechanism")
      .or(`name.ilike.%${q}%,aliases.cs.{${q}}`)
      .limit(10),
  ]);
  return NextResponse.json({ studies: studies ?? [], policy: policy ?? [], peptides: peptides ?? [] });
}
