# Peptide Research Assimilator — Implementation Plan

## Context

The user wants the best web-based research companion for peptide researchers: a continuously-updated, AI-powered repository where every current and past study on research-use peptides (BPC-157, TB-500, GHK-Cu, GLP-1 analogs, melanotan, thymosins, etc.) is ingested, normalized into standardized tables, ranked, and summarized. Today the repo at `/home/user/EQuity` is empty — this is a greenfield build. Eventual goal is to monetize with research-only peptide sales, but the immediate focus is the research companion.

Decisions confirmed with the user:
- **Scope**: Research-use peptides.
- **MVP**: Standardized research DB + search/filter/ranking + auto-ingest of new research + policy tracker (AI chat Q&A and e-commerce deferred to v2).
- **Ingestion**: Hybrid — auto-crawl public APIs + manual DOI/PDF upload.
- **Stack**: Next.js (App Router, TS) + Postgres + pgvector + Claude API, on Vercel + Supabase.
- **Access**: Public read, login (Supabase Auth) to contribute corrections/uploads.
- **Self-improvement**: User feedback/corrections + eval harness with prompt versioning + auto re-extraction on Claude model upgrades.

Work is on branch `claude/peptides-research-platform-rL4wr`.

---

## Architecture

```
 ┌─────────────────────┐     ┌──────────────────────┐
 │ Next.js (Vercel)    │◀───▶│ Supabase Postgres    │
 │  - App Router (RSC) │     │  + pgvector          │
 │  - API routes       │     │  + Row-level Sec.    │
 │  - Supabase Auth    │     │  + Storage (PDFs)    │
 └────────┬────────────┘     └──────────┬───────────┘
          │                             │
          ▼                             ▼
 ┌─────────────────────┐     ┌──────────────────────┐
 │ Ingestion workers   │     │ Claude API           │
 │ (Vercel Cron +      │────▶│  - Sonnet: extract,  │
 │  Supabase pg_cron)  │     │    summarize, rank   │
 │  - PubMed           │     │  - Opus: hard cases, │
 │  - ClinicalTrials   │     │    evals             │
 │  - bioRxiv/medRxiv  │     └──────────────────────┘
 │  - FDA/EMA/WADA     │
 └─────────────────────┘
```

---

## Data model (Postgres)

Core tables (standardized schema — this *is* the product):

- `peptides` — canonical list. Fields: `id`, `name`, `aliases[]`, `sequence`, `cas_number`, `mechanism`, `indications_tags[]`, `category` (research/therapeutic/both), `legal_status_jsonb`.
- `studies` — one row per paper/trial. Fields: `id`, `source` (pubmed/ct.gov/biorxiv/manual), `source_id`, `doi`, `title`, `authors[]`, `year`, `journal`, `study_type` (RCT/cohort/case-report/in-vitro/animal/review), `n_subjects`, `species` (human/rat/mouse/in-vitro), `design_jsonb`, `dose_jsonb`, `duration_days`, `route`, `primary_outcomes_jsonb`, `secondary_outcomes_jsonb`, `adverse_events_jsonb`, `conclusion`, `pdf_url`, `abstract`, `full_text_tsv`, `embedding vector(1536)`, `quality_score numeric`, `risk_of_bias_jsonb`, `extraction_version`, `extraction_model`, `extracted_at`.
- `study_peptides` — many-to-many join (a study can cover multiple peptides).
- `indications` — controlled vocabulary (MeSH-linked where possible).
- `study_indications` — many-to-many.
- `highlights` — AI-generated TL;DR/key-findings per study, versioned.
- `rankings` — per-peptide and per-indication ranked lists; cached view fed by the ranker.
- `policy_items` — `id`, `jurisdiction` (FDA/EMA/WADA/DEA/compounding-pharmacy), `status` (banned/restricted/approved/OTC/Rx), `peptide_id`, `effective_date`, `source_url`, `summary`, `embedding`, `last_checked_at`.
- `users` — Supabase auth mirror.
- `contributions` — user corrections/notes on `studies` or `peptides` (field-level diffs + upvotes).
- `feedback` — thumbs up/down on AI highlights + extractions, with optional comment.
- `extraction_runs` — audit log: model, prompt_version, input hash, token cost, latency, eval scores.
- `eval_cases` — golden set: `input_text`, `expected_jsonb`, `rubric`.
- `eval_results` — run × case × prompt_version → pass/fail + diff.

Supabase pg_cron drives scheduled ingestion + re-extraction jobs.

---

## Ingestion + extraction pipeline

1. **Crawlers** (`src/lib/ingestion/*`):
   - `pubmed.ts` — E-utilities `esearch` + `efetch` for each peptide alias, incremental by date.
   - `clinicaltrials.ts` — CT.gov v2 API.
   - `biorxiv.ts` / `medrxiv.ts` — details API.
   - `policy/*.ts` — FDA press releases RSS, EMA feeds, WADA prohibited list diff, state-board compounding updates.
   Each writes raw records to a `raw_documents` table (idempotent on `source + source_id`).

2. **Extractor** (`src/lib/extraction/extract.ts`):
   - Uses Claude Sonnet with a versioned prompt + strict JSON schema (zod) matching `studies` fields.
   - Prompt caching on the schema/instructions block (it's large and reused across every call).
   - Falls back to Opus for low-confidence or long full-texts.
   - Writes to `studies` and logs to `extraction_runs`. Each row stamps `extraction_version` and `extraction_model`.

3. **Embedder** — same Claude-extracted abstract → embeddings via `text-embedding-3-small` (OpenAI) or Voyage. Stored in `studies.embedding` for semantic search.

4. **Ranker** (`src/lib/ranking/score.ts`) — deterministic composite:
   `quality = w1·study_type_weight + w2·log(n_subjects) + w3·journal_impact + w4·recency + w5·human_vs_animal + w6·risk_of_bias_inv`. Tunable weights in config; surfaced as "Why this ranks high".

5. **Highlights** — Claude generates per-study TL;DR (3 bullets: finding, effect size, caveat) and a per-peptide rollup ("What the evidence says about BPC-157 for tendinopathy").

---

## Frontend (Next.js App Router)

Key routes:
- `/` — landing + global search.
- `/peptides` — grid of peptides with tile stats (n studies, top indication, latest research date, policy flags).
- `/peptides/[slug]` — peptide detail: overview, ranked studies table (sortable by quality/recency/n/effect), indication breakdown, policy timeline, AI-generated evidence summary with citations.
- `/studies/[id]` — full standardized fact sheet (the "table" the user asked for), with original source link, AI highlights, extraction provenance, feedback buttons, correction form.
- `/search` — combined keyword + semantic search across studies + policy.
- `/policy` — policy feed, filterable by peptide/jurisdiction.
- `/contribute` — submit DOI/PDF, view your contributions (auth required).
- `/admin/evals` — eval dashboard (gated).

Components reuse a `StudyFactTable` so every study displays the same standardized fields — the core UX promise.

---

## Self-improvement mechanisms

1. **User feedback + corrections**
   - Thumbs up/down on every highlight + extraction field.
   - Field-level "Suggest correction" → stored as diff in `contributions`, shown with pending badge, merged by moderator or auto-merged on N upvotes.
   - Feedback is surfaced into the eval golden set pipeline (script converts high-confidence corrections into `eval_cases`).

2. **Eval harness + prompt versioning** (`evals/`)
   - Prompts stored in `src/lib/prompts/*.ts` with semver.
   - `pnpm eval` runs the golden set against current prompt/model, diffs vs. last baseline, fails CI on regression.
   - `evals/cases/*.json` — curated + auto-harvested from corrections.
   - GitHub Action runs evals on every PR that touches prompts or extraction code.

3. **Auto re-extraction on model upgrades**
   - `src/lib/extraction/reextract-job.ts` — nightly pg_cron job picks N oldest-`extraction_version` rows, re-runs extraction with current model, writes new `studies` row version (soft-versioned), diffs against prior; flags drift for review.
   - When a new Claude model ships, a one-off `re-extract:all` script backfills.

---

## File/folder layout (target)

```
/
  app/
    (marketing)/page.tsx
    peptides/page.tsx
    peptides/[slug]/page.tsx
    studies/[id]/page.tsx
    search/page.tsx
    policy/page.tsx
    contribute/page.tsx
    admin/evals/page.tsx
    api/
      search/route.ts
      feedback/route.ts
      contributions/route.ts
      ingest/[source]/route.ts   # cron-triggered
  src/
    lib/
      db/ (supabase client, typed queries via drizzle or kysely)
      ingestion/ (pubmed.ts, clinicaltrials.ts, biorxiv.ts, policy/*)
      extraction/ (extract.ts, reextract-job.ts, schema.ts)
      prompts/ (extract.v1.ts, highlight.v1.ts, ...)
      ranking/score.ts
      embeddings/embed.ts
      claude/client.ts        # prompt caching wrapper, retries
    components/
      StudyFactTable.tsx
      PeptideCard.tsx
      RankedStudyList.tsx
      FeedbackButtons.tsx
      CorrectionForm.tsx
  evals/
    cases/*.json
    runner.ts
    report.ts
  supabase/
    migrations/*.sql
    seed/peptides.sql          # seed canonical research peptides list
  .github/workflows/
    evals.yml
    ingest.yml
```

Critical files to create (first-pass order):
1. `supabase/migrations/0001_init.sql` — schema above.
2. `src/lib/claude/client.ts` — Claude wrapper with prompt caching + retries.
3. `src/lib/prompts/extract.v1.ts` + `src/lib/extraction/schema.ts` (zod).
4. `src/lib/extraction/extract.ts`.
5. `src/lib/ingestion/pubmed.ts` + `clinicaltrials.ts`.
6. `src/lib/ranking/score.ts`.
7. `app/peptides/[slug]/page.tsx` + `components/StudyFactTable.tsx`.
8. `evals/runner.ts` + a starter 20-case golden set.

---

## Phased delivery

**Phase 0 — Scaffold (0.5 day)**
- `create-next-app` TS App Router; Tailwind + shadcn/ui; Supabase project; env + local dev.

**Phase 1 — Schema + seed (1 day)**
- Migration 0001; seed canonical research peptides (≈30 with aliases, CAS, categories).

**Phase 2 — Extraction core (2 days)**
- Claude client with prompt caching.
- Zod schema + v1 extraction prompt.
- Manual-upload path: paste abstract/PDF → extract → preview → save.

**Phase 3 — Auto ingestion (2 days)**
- PubMed + CT.gov + bioRxiv crawlers; pg_cron nightly.
- Embeddings + semantic search endpoint.

**Phase 4 — UI (2 days)**
- Peptide index, peptide detail, study detail with `StudyFactTable`, search, feedback buttons.

**Phase 5 — Ranking + highlights (1 day)**
- Composite quality score; per-peptide AI evidence summary with citations.

**Phase 6 — Policy tracker (1 day)**
- FDA/EMA/WADA ingestion; `/policy` feed; peptide detail cross-link.

**Phase 7 — Self-improvement (2 days)**
- Corrections + contributions flow (auth-gated).
- Eval harness + starter golden set + CI workflow.
- Re-extraction job scaffolding.

---

## Verification

1. **Local dev**: `pnpm dev`, seed DB, trigger one-off ingestion (`pnpm ingest:pubmed --peptide=bpc-157 --limit=25`), confirm studies populate with all standardized fields.
2. **Extraction correctness**: `pnpm eval` against golden set; baseline ≥90% field-level accuracy before shipping.
3. **UI walkthrough in browser**: load `/peptides/bpc-157`, confirm ranked study table renders, all fact-sheet fields populated, citations link out, feedback buttons fire, correction form submits (as logged-in user).
4. **Search**: keyword + semantic queries return sensible results; policy items appear in `/policy` with peptide links.
5. **Cron smoke test**: manually invoke ingestion route; confirm idempotency (re-running doesn't duplicate).
6. **Self-improve loop**: submit a correction, approve in admin, confirm it lands in `eval_cases`; bump prompt version, re-run evals, confirm diff report.
7. **Deploy**: push to `claude/peptides-research-platform-rL4wr`; Vercel preview; smoke-test production build.

---

## Explicitly out of scope for v1 (deferred)

- AI chat/Q&A over corpus (v2 — infra from RAG is already in place via embeddings).
- E-commerce for research-use peptide sales (v2 — requires legal review, payment/KYC, age-gating, research-use attestation; keeping it out lets v1 ship as a clean research tool).
- Mobile app.
