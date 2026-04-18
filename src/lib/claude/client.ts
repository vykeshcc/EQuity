import { GoogleGenAI } from "@google/genai";

const DEFAULT_EXTRACTION_MODEL = process.env.GEMINI_EXTRACTION_MODEL || "gemini-2.5-pro";
const DEFAULT_HARD_MODEL = process.env.GEMINI_HARD_MODEL || "gemini-2.5-pro";

let client: GoogleGenAI | null = null;
export function getGemini(): GoogleGenAI {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

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
  /** Attempt up to this many times on 429/5xx. */
  maxRetries?: number;
  /** Force hard model path for complex/long inputs. */
  useHardModel?: boolean;
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

function buildSystemInstruction(system: ClaudeCallOptions["system"]): string | undefined {
  if (!system) return undefined;
  if (typeof system === "string") return system;
  return system.map((b) => b.text).join("\n\n");
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callClaude(opts: ClaudeCallOptions): Promise<ClaudeCallResult> {
  const gemini = getGemini();
  const model = opts.model ?? (opts.useHardModel ? DEFAULT_HARD_MODEL : DEFAULT_EXTRACTION_MODEL);
  const maxRetries = opts.maxRetries ?? 3;
  const systemInstruction = buildSystemInstruction(opts.system);

  const contents = opts.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const startedAt = Date.now();
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model,
        contents,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          maxOutputTokens: opts.maxTokens ?? 4096,
          temperature: opts.temperature ?? 0,
        },
      });

      const text = result.text ?? "";
      const u = result.usageMetadata ?? {};
      return {
        text,
        model,
        stopReason: result.candidates?.[0]?.finishReason?.toString() ?? null,
        usage: {
          inputTokens: u.promptTokenCount ?? 0,
          outputTokens: u.candidatesTokenCount ?? 0,
          cacheCreationTokens: 0,
          cacheReadTokens: u.cachedContentTokenCount ?? 0,
        },
        latencyMs: Date.now() - startedAt,
        raw: result,
      };
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      const retriable = status === 429 || (status >= 500 && status < 600) || err?.code === "ECONNRESET";
      if (!retriable || attempt === maxRetries) break;
      const backoff = Math.min(16000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 500);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

/** Parse a model response that was asked to return JSON, tolerating code-fenced output. */
export function parseJsonResponse<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const startObj = body.indexOf("{");
  const startArr = body.indexOf("[");
  const start = [startObj, startArr].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  return JSON.parse(body.slice(start)) as T;
}
