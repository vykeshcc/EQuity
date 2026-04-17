import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude client wrapper with:
 *  - Singleton Anthropic SDK instance
 *  - Prompt caching on large/static blocks (schema + instructions)
 *  - Retry with exponential backoff on transient errors
 *  - Usage accounting returned alongside the result
 */

const DEFAULT_EXTRACTION_MODEL = process.env.ANTHROPIC_EXTRACTION_MODEL || "claude-sonnet-4-6";
const DEFAULT_HARD_MODEL = process.env.ANTHROPIC_HARD_MODEL || "claude-opus-4-7";

let client: Anthropic | null = null;
export function getAnthropic(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface CachedBlock {
  text: string;
  cache?: boolean;
}

export interface ClaudeCallOptions {
  system?: CachedBlock[] | string;
  messages: Anthropic.MessageParam[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Attempt up to this many times on 429/5xx. */
  maxRetries?: number;
  /** Force Opus path for hard/long inputs. */
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
  raw: Anthropic.Message;
}

function buildSystem(system: ClaudeCallOptions["system"]): string | Anthropic.TextBlockParam[] | undefined {
  if (!system) return undefined;
  if (typeof system === "string") return system;
  return system.map((b) => {
    const block: Anthropic.TextBlockParam = { type: "text", text: b.text };
    if (b.cache) (block as any).cache_control = { type: "ephemeral" };
    return block;
  });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callClaude(opts: ClaudeCallOptions): Promise<ClaudeCallResult> {
  const anthropic = getAnthropic();
  const model = opts.model ?? (opts.useHardModel ? DEFAULT_HARD_MODEL : DEFAULT_EXTRACTION_MODEL);
  const maxRetries = opts.maxRetries ?? 3;
  const system = buildSystem(opts.system);

  const startedAt = Date.now();
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: opts.maxTokens ?? 4096,
        temperature: opts.temperature ?? 0,
        system: system as any,
        messages: opts.messages,
      });
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      const u: any = msg.usage ?? {};
      return {
        text,
        model: msg.model,
        stopReason: msg.stop_reason,
        usage: {
          inputTokens: u.input_tokens ?? 0,
          outputTokens: u.output_tokens ?? 0,
          cacheCreationTokens: u.cache_creation_input_tokens ?? 0,
          cacheReadTokens: u.cache_read_input_tokens ?? 0,
        },
        latencyMs: Date.now() - startedAt,
        raw: msg,
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

/** Parse a Claude response that was asked to return JSON, tolerating code-fenced output. */
export function parseJsonResponse<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  // Strip any leading prose before first `{` or `[`.
  const startObj = body.indexOf("{");
  const startArr = body.indexOf("[");
  const start = [startObj, startArr].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  return JSON.parse(body.slice(start)) as T;
}
