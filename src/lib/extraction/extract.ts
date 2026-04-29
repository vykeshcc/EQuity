import { callClaude, parseJsonResponse } from "@/lib/claude/client";
import { ExtractedStudy, SCHEMA_VERSION } from "@/lib/extraction/schema";
import { EXTRACT_PROMPT_VERSION, EXTRACT_SYSTEM_STATIC, buildExtractUserMessage } from "@/lib/prompts/extract.v1";
import { hashString } from "@/lib/utils/cn";

export interface ExtractInput {
  source: "pubmed" | "clinicaltrials" | "biorxiv" | "medrxiv" | "manual" | "openalex";
  source_id: string;
  title?: string | null;
  abstract?: string | null;
  full_text?: string | null;
  journal?: string | null;
  year?: number | null;
  authors?: string[];
  doi?: string | null;
}

export interface ExtractOutput {
  data: ExtractedStudy;
  model: string;
  promptVersion: string;
  schemaVersion: string;
  inputHash: string;
  usage: { inputTokens: number; outputTokens: number; cachedTokens: number };
  latencyMs: number;
}

/**
 * Extract a study into the standardized schema.
 * Falls back to the hard model on schema-validation failure or very long full-text.
 */
export async function extractStudy(input: ExtractInput): Promise<ExtractOutput> {
  const userMsg = buildExtractUserMessage(input);
  const inputHash = hashString(userMsg);
  const longInput = (input.full_text?.length ?? 0) > 40_000;

  const attempt = async (useHard: boolean) => {
    const res = await callClaude({
      useHardModel: useHard,
      system: [
        { text: EXTRACT_SYSTEM_STATIC, cache: true }, // cached: static schema + rules
      ],
      messages: [{ role: "user", content: userMsg }],
      maxTokens: 8192,
      temperature: 0,
    });
    const json = parseJsonResponse(res.text);
    const parsed = ExtractedStudy.safeParse(json);
    return { res, parsed };
  };

  let { res, parsed } = await attempt(longInput);
  if (!parsed.success) {
    // Retry once with Opus on validation failure.
    const hard = await attempt(true);
    if (!hard.parsed.success) {
      throw new Error(
        `Extraction failed schema validation: ${hard.parsed.error.issues.map((i) => i.path.join(".") + ":" + i.message).join("; ")}`,
      );
    }
    res = hard.res;
    parsed = hard.parsed;
  }

  return {
    data: parsed.data,
    model: res.model,
    promptVersion: EXTRACT_PROMPT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    inputHash,
    usage: {
      inputTokens: res.usage.inputTokens,
      outputTokens: res.usage.outputTokens,
      cachedTokens: res.usage.cacheReadTokens,
    },
    latencyMs: res.latencyMs,
  };
}
