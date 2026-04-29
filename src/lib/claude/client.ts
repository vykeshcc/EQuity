import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

/**
 * AI client wrapper using Google Gemini.
 * Maintains the same exported API as the original Claude client so all
 * callers (extract.ts, evidence-summary.ts, fda.ts) work without changes.
 */

const DEFAULT_EXTRACTION_MODEL =
  process.env.GOOGLE_EXTRACTION_MODEL || "gemini-2.5-flash";
const DEFAULT_HARD_MODEL =
  process.env.GOOGLE_HARD_MODEL || "gemini-2.5-pro";

let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY not set");
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return genAI;
}

/** Kept for source compatibility — cache hints are ignored (Gemini handles caching differently). */
export interface CachedBlock {
  text: string;
  cache?: boolean;
}

export interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeCallOptions {
  system?: CachedBlock[] | string;
  messages: MessageParam[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  maxRetries?: number;
  useHardModel?: boolean;
  /** No-op — kept for source compatibility. */
  cache?: boolean;
}

export interface ClaudeCallResult {
  text: string;
  model: string;
  stopReason: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
  };
  latencyMs: number;
  raw: unknown;
}

function resolveSystem(system: ClaudeCallOptions["system"]): string {
  if (!system) return "";
  if (typeof system === "string") return system;
  return system.map((b) => b.text).join("\n");
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callClaude(opts: ClaudeCallOptions): Promise<ClaudeCallResult> {
  const modelName =
    opts.model ?? (opts.useHardModel ? DEFAULT_HARD_MODEL : DEFAULT_EXTRACTION_MODEL);
  const maxRetries = opts.maxRetries ?? 3;
  const systemText = resolveSystem(opts.system);

  const model: GenerativeModel = getGenAI().getGenerativeModel({
    model: modelName,
    systemInstruction: systemText || undefined,
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0,
    },
  });

  // Convert Anthropic-style messages to Gemini content format.
  const contents = opts.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const startedAt = Date.now();
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({ contents });
      const response = result.response;
      const text = response.text();
      const meta = response.usageMetadata;

      return {
        text,
        model: modelName,
        stopReason: response.candidates?.[0]?.finishReason ?? null,
        usage: {
          inputTokens: meta?.promptTokenCount ?? 0,
          outputTokens: meta?.candidatesTokenCount ?? 0,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
        },
        latencyMs: Date.now() - startedAt,
        raw: response,
      };
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      const retriable =
        status === 429 || (status >= 500 && status < 600) || err?.code === "ECONNRESET";
      if (!retriable || attempt === maxRetries) break;
      const backoff =
        Math.min(16000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 500);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

export function parseJsonResponse<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const startObj = body.indexOf("{");
  const startArr = body.indexOf("[");
  const start = [startObj, startArr].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const slice = body.slice(start);
  try {
    return JSON.parse(slice) as T;
  } catch {
    // Attempt repair: truncate at last complete key-value pair
    const lastComma = slice.lastIndexOf(",");
    if (lastComma > 0) {
      try { return JSON.parse(slice.slice(0, lastComma) + "}") as T; } catch {}
    }
    throw new SyntaxError(`JSON parse failed. Raw (first 200): ${slice.slice(0, 200)}`);
  }
}

/** @deprecated Use resolveSystem internally. Kept for any external callers. */
export function buildSystem(
  system: ClaudeCallOptions["system"]
): string | undefined {
  return resolveSystem(system) || undefined;
}
