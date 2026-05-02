/**
 * Creates the articles and article_sources tables.
 * Run: npx tsx --env-file=.env.local scripts/create-articles-tables.ts
 */
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const SQL = `
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  peptide_id uuid REFERENCES peptides(id),
  hero_image text NOT NULL,
  hero_alt text NOT NULL,
  reading_time int NOT NULL DEFAULT 8,
  researcher jsonb NOT NULL DEFAULT '{}'::jsonb,
  article_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  body text[] NOT NULL DEFAULT '{}',
  pull_quote text,
  quality_assessment text,
  research_score_rationale text,
  generation_model text,
  generation_prompt_version text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_published ON articles (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS articles_peptide ON articles (peptide_id);

CREATE TABLE IF NOT EXISTS article_sources (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  study_id uuid REFERENCES studies(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, study_id)
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY articles_public_read ON articles FOR SELECT USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE article_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY article_sources_public_read ON article_sources FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected. Creating articles tables…");
  try {
    await client.query(SQL);
    console.log("✓ articles table created");
    console.log("✓ article_sources table created");
    console.log("✓ indexes and RLS policies applied");
  } catch (err: any) {
    console.error("✗ Error:", err.message, "code:", err.code);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
