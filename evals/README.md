# Eval harness

Runs the current extraction prompt against a golden set of peptide papers and
scores per-field accuracy. CI gates merges on a minimum pass rate.

## Run

```bash
pnpm eval                      # uses env ANTHROPIC_API_KEY, default min pass 0.8
EVAL_MIN_PASS_RATE=0.9 pnpm eval
```

## Add a case

Create `evals/cases/<name>.json` with:

```json
{
  "name": "unique-name",
  "input": { "source": "manual", "source_id": "...", "title": "...", "abstract": "..." },
  "expected": { "study_type": "RCT", "n_subjects": 1961, "peptides": ["semaglutide"] }
}
```

Include only the fields you want to assert on. Numeric comparisons for
`n_subjects` / `duration_days` allow ±10% tolerance; string comparisons are
case-insensitive.

## Harvesting from corrections

High-confidence moderator-approved corrections are periodically converted into
eval cases by `scripts/harvest-evals.ts` (TODO — v2).
