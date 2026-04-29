/* eslint-disable no-console */
/**
 * CLI entrypoint for one-off ingestion:
 *   pnpm ingest:pubmed  --peptide bpc-157 --limit 25
 *   pnpm ingest:ctgov   --peptide semaglutide
 *   pnpm ingest:biorxiv --days 60
 *   pnpm ingest:policy
 */
import { getAdminDb } from "../src/lib/db/client";
import { ingestPubmedForPeptide } from "../src/lib/ingestion/pubmed";
import { ingestCtGovForPeptide } from "../src/lib/ingestion/clinicaltrials";
import { ingestBiorxivForPeptide } from "../src/lib/ingestion/biorxiv";
import { ingestOpenAlexForPeptide } from "../src/lib/ingestion/openalex";
import { ingestFdaPolicy } from "../src/lib/policy/fda";
import { ingestWadaPolicy } from "../src/lib/policy/wada";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const source = process.argv[2];
  const db = getAdminDb();
  const peptideSlug = arg("peptide");
  const limit = Number(arg("limit") ?? "25");
  const days = Number(arg("days") ?? "30");

  const peptides = peptideSlug
    ? (await db.from("peptides").select("id,name,aliases,slug").eq("slug", peptideSlug)).data ?? []
    : (await db.from("peptides").select("id,name,aliases,slug")).data ?? [];

  switch (source) {
    case "pubmed":
      for (const p of peptides) console.log(await ingestPubmedForPeptide(db, p as any, { limit, sinceDays: days }));
      break;
    case "clinicaltrials":
      for (const p of peptides) console.log(await ingestCtGovForPeptide(db, p as any, { limit }));
      break;
    case "biorxiv":
      for (const p of peptides) console.log(await ingestBiorxivForPeptide(db, p as any, { daysBack: days }));
      break;
    case "openalex":
      for (const p of peptides) console.log(await ingestOpenAlexForPeptide(db, p as any, { limit, sinceDays: days }));
      break;
    case "policy":
      console.log(await ingestFdaPolicy(db));
      console.log(await ingestWadaPolicy(db));
      break;
    default:
      console.error(`Unknown source: ${source}`);
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
