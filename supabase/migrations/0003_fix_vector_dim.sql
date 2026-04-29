-- Fix vector dimensions from 1024 → 768 (Google gemini-embedding-001 with outputDimensionality=768).
-- The CREATE TABLE migration skipped this change since the columns already existed.

alter table studies alter column embedding type vector(768) using embedding::text::vector(768);
alter table policy_items alter column embedding type vector(768) using embedding::text::vector(768);

-- Re-create the HNSW indexes with the correct dimension.
drop index if exists studies_embedding;
create index if not exists studies_embedding on studies using hnsw (embedding vector_cosine_ops);
