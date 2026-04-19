import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/db/client";
import { ingestPubmedForPeptide } from "@/lib/ingestion/pubmed";
import { ingestCtGovForPeptide } from "@/lib/ingestion/clinicaltrials";
import { ingestBiorxivForPeptide } from "@/lib/ingestion/biorxiv";
import { ingestFdaPolicy } from "@/lib/policy/fda";
import { ingestWadaPolicy } from "@/lib/policy/wada";
import { reextractBatch } from "@/lib/extraction/reextract-job";
import { generateEvidenceSummary } from "@/lib/extraction/evidence-summary";

/**
 * Cron-triggered ingestion. Vercel Cron sends GET; manual callers may use POST.
 *   GET /api/ingest/pubmed        — per-peptide PubMed sweep
 *   GET /api/ingest/clinicaltrials
 *   GET /api/ingest/biorxiv
 *   GET /api/ingest/policy        — FDA + WADA
 *   GET /api/ingest/reextract     — re-extraction pass
 *   GET /api/ingest/summaries     — regenerate evidence summaries
 *
 * Protected by CRON_SECRET: Vercel injects it as Authorization: Bearer <secret>;
 * manual callers may also pass x-cron-secret.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface RouteProps {
  params: Promise<{ source: string }>;
}

async function handle(req: Request, source: string): Promise<Response> {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  // Manual callers may use x-cron-secret header.
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const legacy = req.headers.get("x-cron-secret");
  const secret = bearer ?? legacy;
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
      case "biorxiv": {
        let query = db.from("peptides").select("id,name,aliases,slug");
        if (peptideSlug) query = query.eq("slug", peptideSlug).limit(1) as any;
        else query = query.limit(200) as any;
        const { data: list, error: listError } = await query;
        if (listError) return NextResponse.json({ ok: false, error: "peptides query failed", detail: listError }, { status: 500 });
        const results = [];
        for (const p of list ?? []) {
          if (source === "pubmed") {
            results.push(await ingestPubmedForPeptide(db, p as any, { limit, sinceDays }));
          } else if (source === "clinicaltrials") {
            results.push(await ingestCtGovForPeptide(db, p as any, { limit }));
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

export async function GET(req: Request, { params }: RouteProps) {
  const { source } = await params;
  return handle(req, source);
}

export async function POST(req: Request, { params }: RouteProps) {
  const { source } = await params;
  return handle(req, source);
}
