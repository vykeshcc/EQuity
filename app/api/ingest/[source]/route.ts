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
 * Cron-triggered ingestion. Vercel Cron hits with GET:
 *   GET /api/ingest/pubmed?sinceDays=2        — per-peptide PubMed sweep
 *   GET /api/ingest/clinicaltrials
 *   GET /api/ingest/biorxiv?sinceDays=3
 *   GET /api/ingest/policy                    — FDA + WADA
 *   GET /api/ingest/reextract?limit=25        — re-extraction pass
 *   GET /api/ingest/summaries                 — regenerate evidence summaries
 *   GET /api/ingest/backfill?peptide=bpc-157  — full historical pull (first-run bootstrap)
 *
 * Auth: Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
 *       Manual callers may use "x-cron-secret: <CRON_SECRET>" instead.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface RouteProps {
  params: Promise<{ source: string }>;
}

function isAuthorized(req: Request): boolean {
  if (!process.env.CRON_SECRET) return true;
  const bearer = req.headers.get("authorization");
  if (bearer === `Bearer ${process.env.CRON_SECRET}`) return true;
  if (req.headers.get("x-cron-secret") === process.env.CRON_SECRET) return true;
  return false;
}

async function handle(req: Request, params: { source: string }): Promise<NextResponse> {
  const { source } = params;
  if (!isAuthorized(req)) {
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
        const list = peptideSlug
          ? (await db.from("peptides").select("id,name,aliases,slug").eq("slug", peptideSlug).limit(1)).data ?? []
          : (await db.from("peptides").select("id,name,aliases,slug")).data ?? [];
        const results = [];
        for (const p of list) {
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

      // Full historical pull — use this once after first deployment to bootstrap the corpus.
      // Pulls up to `limit` studies per source per peptide with no date filter.
      case "backfill": {
        const list = peptideSlug
          ? (await db.from("peptides").select("id,name,aliases,slug").eq("slug", peptideSlug).limit(1)).data ?? []
          : (await db.from("peptides").select("id,name,aliases,slug")).data ?? [];
        const results: Record<string, any[]> = { pubmed: [], clinicaltrials: [], biorxiv: [] };
        for (const p of list) {
          results.pubmed.push(await ingestPubmedForPeptide(db, p as any, { limit }));
          results.clinicaltrials.push(await ingestCtGovForPeptide(db, p as any, { limit }));
          results.biorxiv.push(await ingestBiorxivForPeptide(db, p as any, { daysBack: 3650 }));
        }
        const [fda, wada] = await Promise.all([ingestFdaPolicy(db), ingestWadaPolicy(db)]);
        return NextResponse.json({ ok: true, source: "backfill", peptides: list.length, results, policy: { fda, wada } });
      }

      default:
        return NextResponse.json({ error: `unknown source: ${source}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// Vercel Cron sends GET; manual/internal callers can use POST.
export async function GET(req: Request, { params }: RouteProps) {
  return handle(req, await params);
}

export async function POST(req: Request, { params }: RouteProps) {
  return handle(req, await params);
}
