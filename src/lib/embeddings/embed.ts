/**
 * Embedding utility. Prefers Voyage (voyage-3-large, 1024-d, strong on biomedical text);
 * falls back to OpenAI text-embedding-3-small (truncated to 1024 via `dimensions`).
 * Must match `studies.embedding vector(1024)` in the schema.
 */

const DIM = 1024;

async function voyageEmbed(texts: string[]): Promise<number[][]> {
  const r = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.VOYAGE_MODEL || "voyage-3-large",
      input: texts,
      input_type: "document",
    }),
  });
  if (!r.ok) throw new Error(`Voyage ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.data.map((d: any) => d.embedding as number[]);
}

async function openAiEmbed(texts: string[]): Promise<number[][]> {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
      dimensions: DIM,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.data.map((d: any) => d.embedding as number[]);
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  if (process.env.VOYAGE_API_KEY) return voyageEmbed(texts);
  if (process.env.OPENAI_API_KEY) return openAiEmbed(texts);
  throw new Error("No embedding provider configured (VOYAGE_API_KEY or OPENAI_API_KEY).");
}

export function toPgVector(v: number[]): string {
  return `[${v.join(",")}]`;
}
