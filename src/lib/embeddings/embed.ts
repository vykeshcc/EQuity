/**
 * Embedding utility using Google gemini-embedding-001 (3072-d with MRL).
 * We request 768-d via outputDimensionality to match `vector(768)` in the schema.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBED_MODEL = "gemini-embedding-001";
export const DIM = 768;

let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY not set");
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return genAI;
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const model = getGenAI().getGenerativeModel({ model: EMBED_MODEL });
  const results = await Promise.all(
    texts.map((t) =>
      model.embedContent({
        content: { role: "user", parts: [{ text: t }] },
        outputDimensionality: DIM,
      } as any)
    )
  );
  return results.map((r) => r.embedding.values);
}

export function toPgVector(v: number[]): string {
  return `[${v.join(",")}]`;
}
