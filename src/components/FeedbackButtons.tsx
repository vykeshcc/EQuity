"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  targetType: "highlight" | "extraction" | "summary" | "ranking";
  targetId: string;
  className?: string;
}

export function FeedbackButtons({ targetType, targetId, className }: Props) {
  const [state, setState] = useState<"idle" | "up" | "down" | "sent">("idle");

  async function send(rating: 1 | -1) {
    setState(rating === 1 ? "up" : "down");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, rating }),
      });
      if (r.ok) setState("sent");
    } catch {
      setState("idle");
    }
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs text-slate-500", className)}>
      <span>Was this useful?</span>
      <button
        onClick={() => send(1)}
        className={cn(
          "rounded border border-slate-200 px-2 py-0.5 hover:border-green-500 hover:text-green-700",
          state === "up" || state === "sent" ? "border-green-500 text-green-700" : "",
        )}
        aria-label="Thumbs up"
      >
        ↑
      </button>
      <button
        onClick={() => send(-1)}
        className={cn(
          "rounded border border-slate-200 px-2 py-0.5 hover:border-red-500 hover:text-red-700",
          state === "down" ? "border-red-500 text-red-700" : "",
        )}
        aria-label="Thumbs down"
      >
        ↓
      </button>
      {state === "sent" ? <span className="text-slate-400">Thanks.</span> : null}
    </div>
  );
}
