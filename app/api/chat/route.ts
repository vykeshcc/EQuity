import { getDb } from "@/lib/db/client";
import { streamGemini } from "@/lib/gemini/client";
import { embed, toPgVector } from "@/lib/embeddings/embed";
import { checkRateLimit, clientKey } from "@/lib/utils/rate-limit";
import { CHAT_SYSTEM, CHAT_PROMPT_VERSION, buildChatContext } from "@/lib/prompts/chat.v1";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 20 messages per IP per hour.
const RATE = { limit: 20, windowMs: 60 * 60 * 1000 };

const MAX_HISTORY_TURNS = 8; // keep last 8 exchange pairs to bound context

export async function POST(req: Request): Promise<Response> {
  const rl = checkRateLimit(clientKey(req), RATE);
  if (!rl.allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  const body = await req.json().catch(() => null);
  const message: string = body?.message?.trim() ?? "";
  const rawHistory: { role: "user" | "assistant"; content: string }[] = body?.history ?? [];

  if (!message || message.length > 2000) {
    return Response.json({ error: "message required (max 2000 chars)" }, { status: 400 });
  }

  const db = getDb();

  // --- Retrieve relevant studies ---
  let studies: any[] = [];
  const hasEmbed = !!(process.env.VOYAGE_API_KEY || process.env.OPENAI_API_KEY);

  if (hasEmbed) {
    try {
      const [vec] = await embed([message]);
      const { data } = await db.rpc("match_studies_full", {
        query_embedding: toPgVector(vec),
        match_count: 8,
      });
      studies = data ?? [];
    } catch {
      // fall through to keyword fallback
    }
  }

  // Keyword fallback when no embed keys or RPC fails.
  if (!studies.length) {
    const terms = message
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 3)
      .slice(0, 4)
      .join(" | ");
    const { data } = await db
      .from("studies")
      .select("id,title,year,journal,study_type,species,n_subjects,quality_score,conclusion,abstract,highlights")
      .textSearch("full_text_tsv", terms, { type: "plain" })
      .order("quality_score", { ascending: false })
      .limit(8);
    studies = data ?? [];
  }

  const { context, sources } = buildChatContext(studies);

  // Truncate history to last N turns to keep context bounded.
  const history = rawHistory.slice(-MAX_HISTORY_TURNS * 2);

  const systemPrompt = sources.length
    ? `${CHAT_SYSTEM}\n\n## Retrieved studies\n\n${context}`
    : `${CHAT_SYSTEM}\n\n(No studies were retrieved for this query. Tell the user you couldn't find relevant studies in the database.)`;

  // --- Stream Claude response via SSE ---
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      }

      // Send sources first so the UI can render chips immediately.
      send({ type: "sources", sources, promptVersion: CHAT_PROMPT_VERSION });

      try {
        const geminiHistory = history.map((m) => ({
          role: m.role === "user" ? "user" as const : "model" as const,
          parts: [{ text: m.content }],
        }));

        await streamGemini({
          system: systemPrompt,
          history: geminiHistory,
          userMessage: message,
          maxTokens: 1024,
          onChunk: (text) => send({ type: "delta", text }),
        });
      } catch (err: any) {
        send({ type: "error", error: err.message ?? "Gemini error" });
      }

      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
