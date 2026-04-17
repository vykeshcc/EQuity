# EQuity — Peptide Research Assimilator

The research companion for peptide researchers. Every current and past study on
research-use peptides is ingested from PubMed, ClinicalTrials.gov, bioRxiv, and
regulatory feeds, extracted by Claude into a standardized fact sheet, ranked by
evidence quality, and summarized with citations.

## What it does

- **Standardized fact sheet** for every study (peptide, indication, n, species,
  dose, outcomes, adverse events, risk of bias, conclusion). One consistent shape
  across the entire corpus.
- **Ranked study lists per peptide** using a transparent 0–100 composite
  (study_type + species + n + recency + risk of bias).
- **AI evidence summaries** per peptide — cited, versioned, regenerated on a
  schedule.
- **Policy tracker** for FDA/EMA/WADA updates, cross-referenced to peptides.
- **Auto-ingestion** from PubMed E-utilities, ClinicalTrials.gov v2 API, and
  bioRxiv/medRxiv daily.
- **Hybrid ingestion**: anyone can paste a title+abstract to extract via the
  `/contribute` page.
- **Self-improvement**:
  - User feedback (thumbs up/down on highlights/extractions/summaries).
  - Field-level corrections from logged-in contributors.
  - Eval harness + prompt versioning with CI regression gate.
  - Nightly re-extraction job that upgrades stale studies when the prompt or
    Claude model advances.

## Stack

- **Next.js 15** (App Router, TypeScript) — frontend + API routes.
- **Supabase** — Postgres + pgvector (1024-d HNSW) + Auth + Storage + RLS.
- **Claude** (`@anthropic-ai/sdk`) — Sonnet 4.6 for extraction, Opus 4.7 for hard
  cases. Prompt caching on the static schema/instructions block.
- **Voyage** (`voyage-3-large`) for embeddings with OpenAI fallback.
- **Vercel Cron** for scheduled ingestion.
- Tailwind + shadcn-style components.

## Repo layout

```
app/                       Next.js App Router pages + API routes
  peptides/[slug]          Peptide detail (ranked studies + evidence summary + policy)
  studies/[id]             Standardized fact sheet (StudyFactTable)
  search/                  Keyword + semantic search
  policy/                  Regulatory feed
  contribute/              Paste abstract → Claude extracts → preview → save
  admin/evals/             Pass rates across prompt versions & models
  api/ingest/[source]/     Cron-triggered (pubmed | clinicaltrials | biorxiv | policy | reextract | summaries)
  api/extract/             Manual-upload extraction endpoint
  api/feedback/            Thumbs up/down
  api/contributions/       Field-level corrections
  api/search/              Keyword + semantic search JSON
src/lib/
  claude/client.ts         Anthropic SDK wrapper: prompt caching, retries, usage accounting
  embeddings/embed.ts      Voyage (default) / OpenAI fallback, 1024-d
  extraction/
    schema.ts              Strict zod schema — the standardized fact sheet
    extract.ts             Runs Claude + validates; falls back to Opus on fail
    persist.ts             Upserts studies, resolves peptide links, logs runs
    evidence-summary.ts    Per-peptide cited summary generator
    reextract-job.ts       Nightly re-extraction on model/prompt upgrades
  prompts/
    extract.v1.ts          Versioned extraction prompt
    evidence-summary.v1.ts Versioned summary prompt
  ingestion/
    pubmed.ts              E-utilities (esearch + efetch + lightweight XML parse)
    clinicaltrials.ts      CT.gov v2 studies API
    biorxiv.ts             bioRxiv/medRxiv details API
  policy/
    fda.ts                 RSS → Claude classifier → policy_items
    wada.ts                Prohibited-list watcher
  ranking/score.ts         Transparent 0–100 composite quality score
  db/                      Supabase client helpers
src/components/
  StudyFactTable.tsx       Canonical standardized view (used on every study page)
  RankedStudyList.tsx
  PeptideCard.tsx
  FeedbackButtons.tsx
  CorrectionForm.tsx
supabase/
  migrations/0001_init.sql       Full schema + RLS + pgvector + triggers
  migrations/0002_search_rpc.sql match_studies / match_policy semantic search RPCs
  seed/peptides.sql              ~30 canonical research-use peptides + indications
evals/
  runner.ts                 Eval harness (field-level scoring, CI gate)
  cases/*.json              Golden set
scripts/
  ingest.ts                 CLI: pnpm ingest:pubmed --peptide bpc-157 --limit 25
  reextract.ts              CLI: pnpm reextract --batch 50
.github/workflows/
  ci.yml                    typecheck + build
  evals.yml                 eval harness on prompt/extraction changes
vercel.json                 Cron schedule (daily ingestion + weekly summaries)
```

## Getting started

```bash
cp .env.example .env.local
# fill in Supabase + Anthropic + Voyage keys

npm install
npm run dev                           # http://localhost:3000

# apply schema + seed (requires Supabase CLI + psql)
npm run db:migrate
npm run db:seed

# kick off a one-off ingestion
npm run ingest:pubmed -- --peptide bpc-157 --limit 25
npm run ingest:policy

# run the eval harness
npm run eval
```

## Verification

1. Load `/peptides/bpc-157` after ingesting — the ranked study table should list
   studies with composite scores, and each `/studies/:id` page should show the
   identical `StudyFactTable`.
2. `/search?q=tendinopathy` returns studies with the tag in title or conclusion.
3. `/policy` lists FDA/WADA items cross-linked to peptides.
4. `/contribute` — paste an abstract, Claude extracts it, you land on the new
   study page.
5. `/admin/evals` — pass rates across prompt versions; PR evals run via CI.

## Roadmap (v2)

- AI chat/Q&A over the corpus (RAG infrastructure already in place via the
  `embedding` column).
- Research-only peptide e-commerce (requires legal review; age-gating;
  research-use attestation).
- Richer risk-of-bias tooling (ROBINS-I for non-randomized).
- PDF ingestion from Supabase Storage.
- Mobile app.

## Disclaimer

This tool is a research companion, not medical advice. Peptides are for research
use only where legally permitted in your jurisdiction. We surface regulatory
status per peptide on every detail page.
