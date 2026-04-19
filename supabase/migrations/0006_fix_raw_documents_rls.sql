-- Idempotently add the public read policy for raw_documents.
-- Migration 0005 conflicted with duplicate policy names from 0001 and was
-- rolled back entirely, leaving raw_documents without a SELECT policy.
-- The anon key therefore returned no rows, breaking the reprocess endpoint.
do $$ begin
  create policy "public read raw_documents" on raw_documents for select using (true);
exception when duplicate_object then null; end $$;

-- Also ensure the service-role write policy exists (belt-and-suspenders).
do $$ begin
  create policy "service write raw_documents" on raw_documents for all using (true) with check (true);
exception when duplicate_object then null; end $$;
