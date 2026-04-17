-- Semantic search RPC backed by the HNSW index on studies.embedding.

create or replace function match_studies(query_embedding vector(1024), match_count int default 40)
returns table (
  id uuid,
  title text,
  year int,
  journal text,
  study_type text,
  species text,
  n_subjects int,
  quality_score numeric,
  similarity float
)
language sql stable as $$
  select s.id, s.title, s.year, s.journal, s.study_type, s.species, s.n_subjects,
         s.quality_score,
         1 - (s.embedding <=> query_embedding) as similarity
  from studies s
  where s.embedding is not null
  order by s.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function match_policy(query_embedding vector(1024), match_count int default 20)
returns table (
  id uuid,
  jurisdiction text,
  status text,
  title text,
  summary text,
  peptide_id uuid,
  similarity float
)
language sql stable as $$
  select p.id, p.jurisdiction, p.status, p.title, p.summary, p.peptide_id,
         1 - (p.embedding <=> query_embedding) as similarity
  from policy_items p
  where p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
