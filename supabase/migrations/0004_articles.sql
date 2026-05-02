-- Articles: editorial journal content
create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  category text not null,
  title text not null,
  subtitle text not null,
  peptide_id uuid references peptides(id),
  hero_image text not null,
  hero_alt text not null,
  reading_time int not null default 8,
  researcher jsonb not null default '{}'::jsonb,
  "references" jsonb not null default '[]'::jsonb,
  body text[] not null default '{}',
  pull_quote text,
  quality_assessment text,
  research_score_rationale text,
  generation_model text,
  generation_prompt_version text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published on articles (published_at desc) where status = 'published';
create index if not exists articles_peptide on articles (peptide_id);

create table if not exists article_sources (
  article_id uuid references articles(id) on delete cascade,
  study_id uuid references studies(id) on delete cascade,
  primary key (article_id, study_id)
);

alter table articles enable row level security;
create policy "articles_public_read" on articles for select using (status = 'published');

alter table article_sources enable row level security;
create policy "article_sources_public_read" on article_sources for select using (true);
