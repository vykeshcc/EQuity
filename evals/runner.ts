/* eslint-disable no-console */
/**
 * Eval harness.
 *
 * Loads golden cases from evals/cases/*.json, runs the current extraction prompt
 * against each, scores per-field accuracy, and writes results to the DB
 * (eval_results) for the admin dashboard. Exits non-zero on regression vs baseline.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { extractStudy } from "../src/lib/extraction/extract";
import { getAdminDb } from "../src/lib/db/client";
import { EXTRACT_PROMPT_VERSION } from "../src/lib/prompts/extract.v1";
import { SCHEMA_VERSION } from "../src/lib/extraction/schema";

interface GoldenCase {
  id?: string;
  name: string;
  input: {
    source: string;
    source_id: string;
    title: string;
    abstract: string;
    journal?: string;
    year?: number;
    authors?: string[];
    doi?: string;
  };
  expected: Record<string, any>;
  rubric?: { tolerances?: Record<string, number>; required_fields?: string[] };
}

function loadCases(): GoldenCase[] {
  const dir = path.join(process.cwd(), "evals", "cases");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")) as GoldenCase);
}

/** Field-level comparison. Returns { field: boolean } where true = match. */
function score(expected: Record<string, any>, actual: Record<string, any>): Record<string, boolean> {
  const scores: Record<string, boolean> = {};
  for (const key of Object.keys(expected)) {
    scores[key] = compareField(expected[key], actual[key], key);
  }
  return scores;
}

function compareField(e: any, a: any, key: string): boolean {
  if (e === null || e === undefined) return a === null || a === undefined;
  if (typeof e === "number" && typeof a === "number") {
    // Allow ±10% on numeric n/duration.
    if (["n_subjects", "duration_days"].includes(key)) {
      return Math.abs(e - a) / Math.max(1, e) <= 0.1;
    }
    return e === a;
  }
  if (typeof e === "string" && typeof a === "string") {
    return e.trim().toLowerCase() === a.trim().toLowerCase();
  }
  if (Array.isArray(e) && Array.isArray(a)) {
    if (key === "peptides" || key === "authors") {
      const ae = new Set(e.map((s: string) => s.toLowerCase()));
      const aa = new Set(a.map((s: string) => s.toLowerCase()));
      return [...ae].every((x) => aa.has(x));
    }
    return e.length === a.length;
  }
  if (e && typeof e === "object") {
    try {
      return JSON.stringify(e) === JSON.stringify(a);
    } catch {
      return false;
    }
  }
  return e === a;
}

async function run() {
  const cases = loadCases();
  console.log(`Running ${cases.length} eval cases against ${EXTRACT_PROMPT_VERSION}+${SCHEMA_VERSION}…`);
  const db = getAdminDb();

  let passed = 0;
  const failures: Array<{ name: string; scores: Record<string, boolean> }> = [];

  for (const c of cases) {
    try {
      const r = await extractStudy(c.input as any);
      const scores = score(c.expected, r.data as any);
      const allPassed = Object.values(scores).every(Boolean);
      if (allPassed) passed++;
      else failures.push({ name: c.name, scores });

      try {
        // Upsert case into DB (idempotent on name).
        const { data: caseRow } = await db
          .from("eval_cases")
          .upsert(
            {
              name: c.name,
              input_text: JSON.stringify(c.input),
              expected: c.expected,
              rubric: c.rubric ?? null,
              source: "curated",
            },
            { onConflict: "name" },
          )
          .select("id")
          .single();

        await db.from("eval_results").insert({
          case_id: caseRow!.id,
          model: r.model,
          prompt_version: r.promptVersion,
          passed: allPassed,
          field_scores: scores,
          diff: allPassed ? null : diff(c.expected, r.data as any),
        });
      } catch (err: any) {
        console.warn(`  (db log skipped: ${err.message})`);
      }

      console.log(`  ${allPassed ? "✓" : "✗"} ${c.name}`);
    } catch (err: any) {
      failures.push({ name: c.name, scores: { ERROR: false } });
      console.log(`  ✗ ${c.name}  — ${err.message}`);
    }
  }

  const total = cases.length;
  const rate = ((passed / Math.max(1, total)) * 100).toFixed(1);
  console.log(`\n${passed}/${total} passed (${rate}%)`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) {
      const bad = Object.entries(f.scores).filter(([, v]) => !v).map(([k]) => k);
      console.log(`  - ${f.name}: ${bad.join(", ")}`);
    }
  }

  // Regression gate: configurable via EVAL_MIN_PASS_RATE (default 0.8).
  const minRate = Number(process.env.EVAL_MIN_PASS_RATE ?? "0.8");
  if (passed / Math.max(1, total) < minRate) {
    console.error(`\nPass rate below threshold (${minRate * 100}%). Failing.`);
    process.exit(1);
  }
}

function diff(e: any, a: any) {
  const out: Record<string, { expected: any; actual: any }> = {};
  for (const k of Object.keys(e)) {
    if (JSON.stringify(e[k]) !== JSON.stringify(a?.[k])) {
      out[k] = { expected: e[k], actual: a?.[k] };
    }
  }
  return out;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
