-- EQuity Peptide Research Assimilator — initial schema
-- Standardized tables are the core of the product: every study exposes the same fields.

create extension if not exists "uuid-ossp";
create extension if not exists vector;
create extension if not exists pg_trgm;

-- ============================================================================
-- Peptides: canonical list
-- ============================================================================
create table if not exists peptides (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  aliases text[] not null default '{}',
  sequence text,
  cas_number text,
  molecular_weight numeric,
  mechanism text,
  category text not null check (category in ('research','therapeutic','both')),
  indications_tags text[] not null default '{}',
  legal_status jsonb not null default '{}'::jsonb,
  overview text,
  study_count int not null default 0,
  latest_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists peptides_name_trgm on peptides using gin (name gin_trgm_ops);
create index if not exists peptides_aliases_gin on peptides using gin (aliases);

-- ============================================================================
-- Indications: controlled vocabulary (MeSH-linked where possible)
-- ============================================================================
create table if not exists indications (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  mesh_id text,
  parent_id uuid references indications(id)
);

-- ============================================================================
-- Raw documents: untransformed source records (idempotent on source + source_id)
-- ============================================================================
create table if not exists raw_documents (
  id uuid primary key default uuid_generate_v4(),
  source text not null,             -- pubmed | clinicaltrials | biorxiv | medrxiv | manual
  source_id text not null,          -- PMID / NCT / DOI
  doi text,
  title text,
  abstract text,
  full_text text,
  fetched_at timestamptz not null default now(),
  payload jsonb not null,
  unique (source, source_id)
);
create index if not exists raw_documents_doi on raw_documents (doi);

-- ============================================================================
-- Studies: standardized fact sheet — this is the product
-- ============================================================================
create table if not exists studies (
  id uuid primary key default uuid_generate_v4(),
  raw_document_id uuid references raw_documents(id) on delete set null,
  source text not null,
  source_id text not null,
  doi text,
  title text not null,
  authors text[] not null default '{}',
  year int,
  journal text,
  study_type text,                 -- RCT | cohort | case-series | in-vitro | animal | review | pilot
  species text,                    -- human | rat | mouse | dog | pig | in-vitro
  n_subjects int,
  design jsonb,                    -- { blinded, controlled, randomized, arms, crossover }
  dose jsonb,                      -- { amount_mg, frequency, total_days, route }
  duration_days int,
  route text,
  primary_outcomes jsonb,          -- [{ name, direction, effect_size, p_value, ci }]
  secondary_outcomes jsonb,
  adverse_events jsonb,            -- [{ event, count, severity }]
  conclusion text,
  abstract text,
  pdf_url text,
  source_url text,
  full_text_tsv tsvector,
  embedding vector(1024),
  quality_score numeric,
  risk_of_bias jsonb,              -- { selection, performance, detection, attrition, reporting, overall }
  highlights jsonb,                -- { tldr: [string,string,string], finding, caveat }
  extraction_version text not null,
  extraction_model text not null,
  extracted_at timestamptz not null default now(),
  superseded_by uuid references studies(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id, extraction_version)
);
create index if not exists studies_year on studies (year desc);
create index if not exists studies_quality on studies (quality_score desc nulls last);
create index if not exists studies_title_trgm on studies using gin (title gin_trgm_ops);
create index if not exists studies_tsv on studies using gin (full_text_tsv);
create index if not exists studies_embedding on studies using hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- Join tables
-- ============================================================================
create table if not exists study_peptides (
  study_id uuid not null references studies(id) on delete cascade,
  peptide_id uuid not null references peptides(id) on delete cascade,
  primary key (study_id, peptide_id)
);
create index if not exists study_peptides_peptide on study_peptides (peptide_id);

create table if not exists study_indications (
  study_id uuid not null references studies(id) on delete cascade,
  indication_id uuid not null references indications(id) on delete cascade,
  primary key (study_id, indication_id)
);

-- ============================================================================
-- Per-peptide AI evidence summaries (versioned)
-- ============================================================================
create table if not exists peptide_evidence_summaries (
  id uuid primary key default uuid_generate_v4(),
  peptide_id uuid not null references peptides(id) on delete cascade,
  indication_id uuid references indications(id) on delete set null,
  summary text not null,
  citations jsonb not null default '[]'::jsonb,
  model text not null,
  prompt_version text not null,
  generated_at timestamptz not null default now()
);
create index if not exists pes_peptide on peptide_evidence_summaries (peptide_id);

-- ============================================================================
-- Policy tracker
-- ============================================================================
create table if not exists policy_items (
  id uuid primary key default uuid_generate_v4(),
  jurisdiction text not null,       -- FDA | EMA | WADA | DEA | state-compounding
  status text not null,             -- banned | restricted | approved | Rx | OTC | under-review
  peptide_id uuid references peptides(id) on delete set null,
  title text,
  summary text,
  effective_date date,
  source_url text not null,
  source_hash text,
  embedding vector(1024),
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists policy_peptide on policy_items (peptide_id);
create index if not exists policy_effective on policy_items (effective_date desc);

-- ============================================================================
-- Users, contributions, feedback
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text,
  affiliation text,
  role text not null default 'contributor' check (role in ('contributor','moderator','admin')),
  created_at timestamptz not null default now()
);

create table if not exists contributions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  target_type text not null check (target_type in ('study','peptide','policy')),
  target_id uuid not null,
  field text not null,
  old_value jsonb,
  new_value jsonb not null,
  rationale text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','merged')),
  upvotes int not null default 0,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists contributions_target on contributions (target_type, target_id);
create index if not exists contributions_status on contributions (status);

create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  target_type text not null,        -- highlight | extraction | summary | ranking
  target_id uuid not null,
  rating smallint not null check (rating in (-1, 1)),
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists feedback_target on feedback (target_type, target_id);

-- ============================================================================
-- Self-improvement: extraction runs + evals
-- ============================================================================
create table if not exists extraction_runs (
  id uuid primary key default uuid_generate_v4(),
  study_id uuid references studies(id) on delete set null,
  raw_document_id uuid references raw_documents(id) on delete set null,
  model text not null,
  prompt_version text not null,
  input_hash text not null,
  input_tokens int,
  output_tokens int,
  cached_tokens int,
  latency_ms int,
  success boolean not null,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists extraction_runs_study on extraction_runs (study_id);

create table if not exists eval_cases (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  input_text text not null,
  expected jsonb not null,
  rubric jsonb,
  source text,                     -- curated | correction | auto
  created_at timestamptz not null default now()
);

create table if not exists eval_results (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references eval_cases(id) on delete cascade,
  model text not null,
  prompt_version text not null,
  passed boolean not null,
  field_scores jsonb not null,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index if not exists eval_results_prompt on eval_results (prompt_version, model);

-- ============================================================================
-- Triggers: maintain peptides.study_count / latest_year
-- ============================================================================
create or replace function refresh_peptide_stats(p uuid) returns void language sql as $$
  update peptides set
    study_count = (select count(*) from study_peptides where peptide_id = p),
    latest_year = (
      select max(s.year) from studies s
      join study_peptides sp on sp.study_id = s.id
      where sp.peptide_id = p
    ),
    updated_at = now()
  where id = p;
$$;

create or replace function trg_refresh_peptide_stats() returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE') then
    perform refresh_peptide_stats(old.peptide_id);
    return old;
  else
    perform refresh_peptide_stats(new.peptide_id);
    return new;
  end if;
end;
$$;

drop trigger if exists study_peptides_stats on study_peptides;
create trigger study_peptides_stats
  after insert or update or delete on study_peptides
  for each row execute function trg_refresh_peptide_stats();

-- ============================================================================
-- Row-level security: public read, authenticated contribute
-- ============================================================================
alter table peptides enable row level security;
alter table studies enable row level security;
alter table raw_documents enable row level security;
alter table study_peptides enable row level security;
alter table study_indications enable row level security;
alter table indications enable row level security;
alter table peptide_evidence_summaries enable row level security;
alter table policy_items enable row level security;
alter table contributions enable row level security;
alter table feedback enable row level security;
alter table profiles enable row level security;

create policy "public read peptides" on peptides for select using (true);
create policy "public read studies" on studies for select using (true);
create policy "public read study_peptides" on study_peptides for select using (true);
create policy "public read study_indications" on study_indications for select using (true);
create policy "public read indications" on indications for select using (true);
create policy "public read summaries" on peptide_evidence_summaries for select using (true);
create policy "public read policy" on policy_items for select using (true);
create policy "public read profiles" on profiles for select using (true);

create policy "users insert feedback" on feedback for insert with check (auth.uid() = user_id);
create policy "users read own feedback" on feedback for select using (auth.uid() = user_id);

create policy "users insert contributions" on contributions for insert with check (auth.uid() = user_id);
create policy "public read contributions" on contributions for select using (true);
create policy "users update own pending contributions" on contributions for update
  using (auth.uid() = user_id and status = 'pending');

create policy "users manage own profile" on profiles for all using (auth.uid() = id);
