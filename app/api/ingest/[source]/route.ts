import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/db/client";
import { ingestPubmedForPeptide } from "@/lib/ingestion/pubmed";
import { ingestCtGovForPeptide } from "@/lib/ingestion/clinicaltrials";
import { ingestBiorxivForPeptide } from "@/lib/ingestion/biorxiv";
import { ingestOpenAlexForPeptide } from "@/lib/ingestion/openalex";
import { ingestFdaPolicy } from "@/lib/policy/fda";
import { ingestWadaPolicy } from "@/lib/policy/wada";
import { reextractBatch } from "@/lib/extraction/reextract-job";
import { generateEvidenceSummary } from "@/lib/extraction/evidence-summary";

/**
 * Cron-triggered ingestion. Vercel Cron / Supabase pg_cron hits:
 *   POST /api/ingest/pubmed        — per-peptide PubMed sweep
 *   POST /api/ingest/clinicaltrials
 *   POST /api/ingest/biorxiv
 *   POST /api/ingest/policy        — FDA + WADA
 *   POST /api/ingest/reextract     — re-extraction pass
 *   POST /api/ingest/summaries     — regenerate evidence summaries
 *
 * Protected by CRON_SECRET header (x-cron-secret).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface RouteProps {
  params: Promise<{ source: string }>;
}

export async function POST(req: Request, { params }: RouteProps) {
  const { source } = await params;
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const url = new URL(req.url);
  const peptideSlug = url.searchParams.get("peptide");
  const limit = Number(url.searchParams.get("limit") ?? "25");
  const sinceDays = Number(url.searchParams.get("sinceDays") ?? "7");

  try {
    switch (source) {
      case "pubmed":
      case "clinicaltrials":
      case "biorxiv":
      case "openalex": {
        const { data: peptides } = await db
          .from("peptides")
          .select("id,name,aliases,slug")
          .eq(peptideSlug ? "slug" : "id", peptideSlug ?? "id")
          .limit(peptideSlug ? 1 : 200);
        // Fallback: if no filter, pull all peptides.
        const list = peptideSlug
          ? peptides ?? []
          : (await db.from("peptides").select("id,name,aliases,slug")).data ?? [];
        const results = [];
        for (const p of list) {
          if (source === "pubmed") {
            results.push(await ingestPubmedForPeptide(db, p as any, { limit, sinceDays }));
          } else if (source === "clinicaltrials") {
            results.push(await ingestCtGovForPeptide(db, p as any, { limit }));
          } else if (source === "openalex") {
            results.push(await ingestOpenAlexForPeptide(db, p as any, { limit, sinceDays }));
          } else {
            results.push(await ingestBiorxivForPeptide(db, p as any, { daysBack: sinceDays }));
          }
        }
        return NextResponse.json({ ok: true, source, results });
      }

      case "policy": {
        const [fda, wada] = await Promise.all([ingestFdaPolicy(db), ingestWadaPolicy(db)]);
        return NextResponse.json({ ok: true, fda, wada });
      }

      case "reextract": {
        const r = await reextractBatch(db, { batchSize: limit });
        return NextResponse.json({ ok: true, ...r });
      }

      case "summaries": {
        const { data: peptides } = await db.from("peptides").select("id,name").limit(50);
        const out = [];
        for (const p of peptides ?? []) {
          try {
            const s = await generateEvidenceSummary(db, p as any);
            out.push({ peptide: p.name, generated: !!s });
          } catch (err: any) {
            out.push({ peptide: p.name, error: err.message });
          }
        }
        return NextResponse.json({ ok: true, summaries: out });
      }

      default:
        return NextResponse.json({ error: `unknown source: ${source}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
