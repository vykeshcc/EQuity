import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/db/client";
import { extractStudy } from "@/lib/extraction/extract";
import { persistStudy } from "@/lib/extraction/persist";

/**
 * Manual-upload ingestion path. Anyone can hit this to extract + save a study
 * (rate-limiting/auth to be added — for now it's the "contribute" surface).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.abstract || !body?.title) {
    return NextResponse.json({ ok: false, error: "title and abstract required" }, { status: 400 });
  }

  const source = "manual" as const;
  const source_id = body.doi || crypto.randomUUID();
  const db = getAdminDb();

  try {
    const { data: raw } = await db
      .from("raw_documents")
      .upsert(
        {
          source,
          source_id,
          doi: body.doi ?? null,
          title: body.title,
          abstract: body.abstract,
          payload: body,
        },
        { onConflict: "source,source_id" },
      )
      .select("id")
      .single();

    const extraction = await extractStudy({
      source,
      source_id,
      title: body.title,
      abstract: body.abstract,
      journal: body.journal ?? null,
      year: body.year ?? null,
      doi: body.doi ?? null,
    });

    const study_id = await persistStudy({
      db,
      raw_document_id: raw?.id ?? null,
      source,
      source_id,
      extraction,
      source_url: body.doi ? `https://doi.org/${body.doi}` : null,
    });
    return NextResponse.json({ ok: true, study_id, data: extraction.data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
