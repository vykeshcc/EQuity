import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerateContentResult,
} from "@google/generative-ai";

const DEFAULT_FLASH_MODEL = process.env.GEMINI_FLASH_MODEL ?? "gemini-2.5-flash";
const DEFAULT_PRO_MODEL = process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro";

let sdk: GoogleGenerativeAI | null = null;
function getSDK(): GoogleGenerativeAI {
  if (!sdk) {
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY not set");
    sdk = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return sdk;
}

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export interface GeminiCallOptions {
  system?: string;
  userMessage: string;
  jsonMode?: boolean;
  usePro?: boolean;
  maxTokens?: number;
  temperature?: number;
  maxRetries?: number;
}

export interface GeminiCallResult {
  text: string;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
  latencyMs: number;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callGemini(opts: GeminiCallOptions): Promise<GeminiCallResult> {
  const modelId = opts.usePro ? DEFAULT_PRO_MODEL : DEFAULT_FLASH_MODEL;
  const maxRetries = opts.maxRetries ?? 3;
  const startedAt = Date.now();

  const model = getSDK().getGenerativeModel({
    model: modelId,
    systemInstruction: opts.system,
    safetySettings: SAFETY,
    generationConfig: {
      responseMimeType: opts.jsonMode ? "application/json" : "text/plain",
      maxOutputTokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0,
    },
  });

  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result: GenerateContentResult = await model.generateContent(opts.userMessage);
      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;
      return {
        text,
        model: modelId,
        usage: {
          inputTokens: usage?.promptTokenCount ?? 0,
          outputTokens: usage?.candidatesTokenCount ?? 0,
        },
        latencyMs: Date.now() - startedAt,
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

/** Parse a Gemini response that was asked to return JSON, tolerating code-fenced output. */
export function parseJsonResponse<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const startObj = body.indexOf("{");
  const startArr = body.indexOf("[");
  const start = [startObj, startArr].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  return JSON.parse(body.slice(start)) as T;
}

/** Stream a Gemini response, calling onChunk for each text piece. */
export async function streamGemini(opts: {
  system?: string;
  history?: { role: "user" | "model"; parts: { text: string }[] }[];
  userMessage: string;
  maxTokens?: number;
  onChunk: (text: string) => void;
}): Promise<void> {
  const model = getSDK().getGenerativeModel({
    model: DEFAULT_FLASH_MODEL,
    systemInstruction: opts.system,
    safetySettings: SAFETY,
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 1024,
      temperature: 0.5,
    },
  });

  const chat = model.startChat({ history: opts.history ?? [] });
  const result = await chat.sendMessageStream(opts.userMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) opts.onChunk(text);
  }
}
