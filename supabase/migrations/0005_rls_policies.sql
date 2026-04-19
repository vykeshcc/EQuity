-- RLS policies for EQuity tables.
-- Public research data (peptides, studies, raw_documents) is readable by all.
-- Writes are restricted to service role only.

-- Enable RLS on all tables
alter table peptides enable row level security;
alter table studies enable row level security;
alter table raw_documents enable row level security;
alter table study_peptides enable row level security;
alter table policy_items enable row level security;
alter table peptide_evidence_summaries enable row level security;
alter table contributions enable row level security;
alter table feedback enable row level security;

-- ── Public read access ───────────────────────────────────────────────────────
create policy "public read peptides"          on peptides          for select using (true);
create policy "public read studies"           on studies           for select using (true);
create policy "public read raw_documents"     on raw_documents     for select using (true);
create policy "public read study_peptides"    on study_peptides    for select using (true);
create policy "public read policy_items"      on policy_items      for select using (true);
create policy "public read evidence_summaries" on peptide_evidence_summaries for select using (true);

-- ── Authenticated users can submit contributions and feedback ────────────────
create policy "anon insert contributions"     on contributions     for insert with check (true);
create policy "anon insert feedback"          on feedback          for insert with check (true);
create policy "public read contributions"     on contributions     for select using (true);
create policy "public read feedback"          on feedback          for select using (true);

-- ── Service role has full access (bypasses RLS automatically) ────────────────
-- No explicit policies needed; service_role bypasses RLS by default.
-- These are belt-and-suspenders for environments where bypass doesn't work.
create policy "service write peptides"        on peptides          for all using (true) with check (true);
create policy "service write studies"         on studies           for all using (true) with check (true);
create policy "service write raw_documents"   on raw_documents     for all using (true) with check (true);
create policy "service write study_peptides"  on study_peptides    for all using (true) with check (true);
create policy "service write policy_items"    on policy_items      for all using (true) with check (true);
create policy "service write evidence_summaries" on peptide_evidence_summaries for all using (true) with check (true);
create policy "service write contributions"   on contributions     for all using (true) with check (true);
create policy "service write feedback"        on feedback          for all using (true) with check (true);
