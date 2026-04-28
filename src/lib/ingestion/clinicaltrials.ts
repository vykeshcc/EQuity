import type { SupabaseClient } from "@supabase/supabase-js";
import { extractStudy } from "@/lib/extraction/extract";
import { persistStudy } from "@/lib/extraction/persist";

/**
 * ClinicalTrials.gov v2 API ingestion.
 * Uses /api/v2/studies with a search term per peptide.
 */

const CT_API = "https://clinicaltrials.gov/api/v2/studies";

interface CtStudy {
  nct: string;
  title: string;
  conditions: string[];
  interventions: string[];
  phase?: string | null;
  enrollment?: number | null;
  status?: string | null;
  start?: string | null;
  completion?: string | null;
  brief?: string | null;
  detailed?: string | null;
  lead_sponsor?: string | null;
  year?: number | null;
}

async function search(term: string, pageSize = 25): Promise<CtStudy[]> {
  const params = new URLSearchParams({
    "query.term": term,
    pageSize: String(pageSize),
    format: "json",
  });
  const r = await fetch(`${CT_API}?${params.toString()}`);
  if (!r.ok) throw new Error(`ct.gov ${r.status}`);
  const j = await r.json();
  const out: CtStudy[] = [];
  for (const s of j.studies ?? []) {
    const ps = s.protocolSection ?? {};
    const id = ps.identificationModule ?? {};
    const cond = ps.conditionsModule ?? {};
    const arms = ps.armsInterventionsModule ?? {};
    const design = ps.designModule ?? {};
    const status = ps.statusModule ?? {};
    const desc = ps.descriptionModule ?? {};
    const sponsor = ps.sponsorCollaboratorsModule ?? {};

    out.push({
      nct: id.nctId,
      title: id.briefTitle ?? id.officialTitle ?? "(untitled trial)",
      conditions: cond.conditions ?? [],
      interventions: (arms.interventions ?? []).map((i: any) => `${i.type}: ${i.name}`),
      phase: (design.phases ?? []).join("/") || null,
      enrollment: design.enrollmentInfo?.count ?? null,
      status: status.overallStatus ?? null,
      start: status.startDateStruct?.date ?? null,
      completion: status.completionDateStruct?.date ?? null,
      brief: desc.briefSummary ?? null,
      detailed: desc.detailedDescription ?? null,
      lead_sponsor: sponsor.leadSponsor?.name ?? null,
      year: Number((status.startDateStruct?.date ?? "").slice(0, 4)) || null,
    });
  }
  return out;
}

export interface CtIngestResult {
  peptide: string;
  fetched: number;
  newStudies: number;
  errors: string[];
}

export async function ingestCtGovForPeptide(
  db: SupabaseClient,
  peptide: { id: string; name: string; aliases: string[] },
  opts: { limit?: number } = {},
): Promise<CtIngestResult> {
  const result: CtIngestResult = { peptide: peptide.name, fetched: 0, newStudies: 0, errors: [] };
  const term = [peptide.name, ...peptide.aliases].join(" OR ");
  const trials = await search(term, opts.limit ?? 25);

  for (const t of trials) {
    try {
      const { data: raw } = await db
        .from("raw_documents")
        .upsert(
          {
            source: "clinicaltrials",
            source_id: t.nct,
            title: t.title,
            abstract: t.brief,
            full_text: t.detailed,
            payload: t as unknown as Record<string, unknown>,
          },
          { onConflict: "source,source_id" },
        )
        .select("id")
        .single();

      const abstractText = [
        `Conditions: ${t.conditions.join("; ")}`,
        `Interventions: ${t.interventions.join("; ")}`,
        `Phase: ${t.phase ?? "—"}. Status: ${t.status ?? "—"}. Enrollment: ${t.enrollment ?? "—"}.`,
        t.brief ?? "",
        t.detailed ?? "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const extraction = await extractStudy({
        source: "clinicaltrials",
        source_id: t.nct,
        title: t.title,
        abstract: abstractText,
        journal: "ClinicalTrials.gov",
        year: t.year,
        authors: t.lead_sponsor ? [t.lead_sponsor] : [],
      });

      await persistStudy({
        db,
        raw_document_id: raw?.id ?? null,
        source: "clinicaltrials",
        source_id: t.nct,
        extraction,
        source_url: `https://clinicaltrials.gov/study/${t.nct}`,
      });
      result.newStudies++;
    } catch (err: any) {
      result.errors.push(`${t.nct}: ${err.message}`);
    }
    result.fetched++;
  }
  return result;
}
