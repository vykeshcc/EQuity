"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ChatSource } from "@/lib/prompts/chat.v1";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

const SUGGESTIONS = [
  "What does the evidence say about BPC-157 for tendon healing?",
  "Compare the quality of human vs animal evidence on GHK-Cu",
  "What are the known adverse effects of melanotan II?",
  "Summarise the evidence on semaglutide for weight loss",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || streaming) return;

      setError(null);
      setInput("");
      const history = messages.map(({ role, content }) => ({ role, content }));
      const userMsg: Message = { role: "user", content: msg };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      // Placeholder assistant message that we'll stream into.
      setMessages((prev) => [...prev, { role: "assistant", content: "", sources: [] }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: msg, history }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `HTTP ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            const evt = JSON.parse(raw);
            if (evt.type === "sources") {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { ...next[next.length - 1], sources: evt.sources };
                return next;
              });
            } else if (evt.type === "delta") {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  content: next[next.length - 1].content + evt.text,
                };
                return next;
              });
            } else if (evt.type === "error") {
              throw new Error(evt.error);
            }
          }
        }
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
        setMessages((prev) => prev.slice(0, -1)); // remove empty assistant msg
      } finally {
        setStreaming(false);
        textareaRef.current?.focus();
      }
    },
    [messages, streaming],
  );

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Research Q&amp;A</h1>
          <p className="text-xs text-slate-500">
            Answers grounded in the EQuity study corpus · not medical advice
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <p className="max-w-md text-sm text-slate-500">
              Ask anything about peptide research. Answers are cited directly from studies in the database.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:border-brand-500 hover:bg-brand-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                m.role === "user"
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white text-slate-800",
              )}
            >
              {m.role === "assistant" ? (
                <>
                  <AssistantText text={m.content} sources={m.sources ?? []} />
                  {m.content === "" && streaming && (
                    <span className="inline-block h-4 w-0.5 animate-pulse bg-slate-400" />
                  )}
                  {(m.sources ?? []).length > 0 && (
                    <SourceList sources={m.sources!} />
                  )}
                </>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about a peptide, indication, or study… (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={streaming}
          className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-60"
        />
        <button
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
          className="self-end rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
        >
          {streaming ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}

/** Renders assistant text with [1] citation tokens replaced by chips. */
function AssistantText({ text, sources }: { text: string; sources: ChatSource[] }) {
  if (!text) return null;
  const sourceMap = new Map(sources.map((s) => [s.num, s]));
  // Split on [N] tokens.
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const num = parseInt(match[1]);
          const src = sourceMap.get(num);
          if (src) {
            return (
              <Link
                key={i}
                href={`/studies/${src.id}`}
                target="_blank"
                title={src.title}
                className="mx-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded bg-brand-100 px-1 text-[10px] font-semibold text-brand-800 hover:bg-brand-200"
              >
                {num}
              </Link>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

/** Numbered source list shown below each assistant response. */
function SourceList({ sources }: { sources: ChatSource[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!sources.length) return null;
  return (
    <div className="mt-3 border-t border-slate-100 pt-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        {expanded ? "Hide" : "Show"} {sources.length} source{sources.length !== 1 ? "s" : ""}
      </button>
      {expanded && (
        <ol className="mt-2 space-y-1">
          {sources.map((s) => {
            const meta = [s.study_type, s.species, s.n_subjects ? `n=${s.n_subjects}` : null, s.year]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={s.id} className="flex gap-2 text-xs text-slate-500">
                <span className="shrink-0 font-semibold text-brand-700">[{s.num}]</span>
                <Link href={`/studies/${s.id}`} target="_blank" className="hover:text-brand-700 hover:underline">
                  {s.title}
                  {meta ? <span className="ml-1 text-slate-400">({meta})</span> : null}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
