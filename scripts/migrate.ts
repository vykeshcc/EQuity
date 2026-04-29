/**
 * Runs SQL migration files against Supabase using node-postgres.
 * Splits files into individual statements and skips "already exists" errors
 * so re-runs are safe.
 * Run: npm run db:migrate
 */
import { Client } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const migrations = [
  "supabase/migrations/0001_init.sql",
  "supabase/migrations/0002_search_rpc.sql",
  "supabase/migrations/0003_fix_vector_dim.sql",
];

// Errors we can safely skip on re-runs.
const SKIP_CODES = new Set(["42P07", "42710", "42P16", "23505", "42701"]);
// 42P07 = relation already exists
// 42710 = object already exists (index, trigger, policy)
// 42P16 = multiple primary keys
// 23505 = unique violation
// 42701 = column already exists

function splitStatements(sql: string): string[] {
  // Naive split on semicolons outside of $$ blocks.
  const stmts: string[] = [];
  let buf = "";
  let inDollar = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (sql.slice(i, i + 2) === "$$") {
      inDollar = !inDollar;
      buf += "$$";
      i++;
      continue;
    }
    if (ch === ";" && !inDollar) {
      const stmt = buf.trim();
      if (stmt) stmts.push(stmt + ";");
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) stmts.push(buf.trim());
  return stmts;
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to database.");

  for (const file of migrations) {
    const sql = readFileSync(join(process.cwd(), file), "utf8");
    const stmts = splitStatements(sql).filter(
      (s) => s && !s.startsWith("--") && s !== ";"
    );
    console.log(`\nRunning ${file} (${stmts.length} statements)…`);

    let skipped = 0;
    let ok = 0;
    for (const stmt of stmts) {
      try {
        await client.query(stmt);
        ok++;
      } catch (err: any) {
        if (SKIP_CODES.has(err.code)) {
          skipped++;
        } else {
          console.error(`\n  ✗ Error:\n    ${stmt.slice(0, 120)}…`);
          console.error(`    ${err.message}`);
          await client.end();
          process.exit(1);
        }
      }
    }
    console.log(`  ✓ ${ok} executed, ${skipped} skipped (already exist)`);
  }

  await client.end();
  console.log("\nMigrations complete.");
}

main();
