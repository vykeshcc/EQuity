/**
 * AI client — OpenRouter + DeepSeek V3.
 * Maintains the same exported interface so all callers are unchanged.
 */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_EXTRACTION_MODEL =
  process.env.OPENROUTER_EXTRACTION_MODEL || "deepseek/deepseek-chat";
const DEFAULT_HARD_MODEL =
  process.env.OPENROUTER_HARD_MODEL || "deepseek/deepseek-chat";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not set");
  return key;
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
  maxRetries?: number;
  useHardModel?: boolean;
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
  const maxRetries = opts.maxRetries ?? 5;
  const systemText = resolveSystem(opts.system);

  const messages: { role: string; content: string }[] = [];
  if (systemText) messages.push({ role: "system", content: systemText });
  for (const m of opts.messages) messages.push({ role: m.role, content: m.content });

  const body = {
    model: modelName,
    messages,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0,
  };

  const startedAt = Date.now();
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
          "HTTP-Referer": "https://equity-peptide.vercel.app",
          "X-Title": "EQuity Peptide Research",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        const err: any = new Error(`OpenRouter ${res.status}: ${errText}`);
        err.status = res.status;
        throw err;
      }

      const json: any = await res.json();
      const choice = json.choices?.[0];
      const text: string = choice?.message?.content ?? "";
      const usage = json.usage ?? {};

      return {
        text,
        model: json.model ?? modelName,
        stopReason: choice?.finish_reason ?? null,
        usage: {
          inputTokens: usage.prompt_tokens ?? 0,
          outputTokens: usage.completion_tokens ?? 0,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
        },
        latencyMs: Date.now() - startedAt,
        raw: json,
      };
    } catch (err: any) {
      lastErr = err;
      const status = err?.status;
      const isRetriable =
        !status ||
        status === 429 ||
        (status >= 500 && status < 600) ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT";

      if (!isRetriable || attempt === maxRetries) break;

      const base = Math.min(60_000, 2000 * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 1000);
      console.warn(
        `[OpenRouter] attempt ${attempt + 1}/${maxRetries} failed (${err?.message?.slice(0, 80)}), retrying in ${Math.round((base + jitter) / 1000)}s...`
      );
      await sleep(base + jitter);
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
    const lastComma = slice.lastIndexOf(",");
    if (lastComma > 0) {
      try {
        return JSON.parse(slice.slice(0, lastComma) + "}") as T;
      } catch {}
    }
    throw new SyntaxError(`JSON parse failed. Raw (first 200): ${slice.slice(0, 200)}`);
  }
}

export function buildSystem(system: ClaudeCallOptions["system"]): string | undefined {
  return resolveSystem(system) || undefined;
}
