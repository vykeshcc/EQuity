-- Enhanced semantic search for RAG/chat — returns full context fields.
-- The existing match_studies is kept unchanged (search page depends on its signature).

create or replace function match_studies_full(
  query_embedding vector(1024),
  match_count int default 8
)
returns table (
  id uuid,
  title text,
  year int,
  journal text,
  study_type text,
  species text,
  n_subjects int,
  quality_score numeric,
  conclusion text,
  abstract text,
  highlights jsonb,
  similarity float
)
language sql stable as $$
  select
    s.id, s.title, s.year, s.journal, s.study_type, s.species, s.n_subjects,
    s.quality_score, s.conclusion, s.abstract, s.highlights,
    1 - (s.embedding <=> query_embedding) as similarity
  from studies s
  where s.embedding is not null
  order by s.embedding <=> query_embedding
  limit match_count;
$$;
