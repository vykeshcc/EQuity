/* eslint-disable no-console */
/**
 * One-off re-extraction pass for after a prompt/schema/model bump.
 *   pnpm reextract --batch 100
 */
import { getAdminDb } from "../src/lib/db/client";
import { reextractBatch } from "../src/lib/extraction/reextract-job";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const batch = Number(arg("batch") ?? "50");
  const db = getAdminDb();
  console.log(await reextractBatch(db, { batchSize: batch }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
