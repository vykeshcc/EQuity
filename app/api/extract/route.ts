import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/db/client";
import { extractStudy } from "@/lib/extraction/extract";
import { persistStudy } from "@/lib/extraction/persist";
import { checkRateLimit, clientKey } from "@/lib/utils/rate-limit";

// 5 extractions per IP per hour.
const RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export async function POST(req: Request) {
  const rl = checkRateLimit(clientKey(req), RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

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
