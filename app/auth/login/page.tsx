"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDb } from "@/lib/db/client";
import Link from "next/link";

type Mode = "signin" | "signup" | "magic";
type Status = "idle" | "loading" | "magic-sent" | "error";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const db = getDb();

    if (mode === "magic") {
      const { error } = await db.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) { setErrorMsg(error.message); setStatus("error"); }
      else setStatus("magic-sent");
      return;
    }

    if (mode === "signup") {
      const { error } = await db.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) { setErrorMsg(error.message); setStatus("error"); }
      else setStatus("magic-sent"); // Supabase sends a confirmation email
      return;
    }

    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) { setErrorMsg(error.message); setStatus("error"); }
    else router.push(next);
  }

  if (status === "magic-sent") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-sm space-y-3 text-center">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-slate-600">We sent a link to <strong>{email}</strong>. Click it to sign in.</p>
          <button onClick={() => setStatus("idle")} className="text-sm text-brand-700 hover:underline">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">
          {mode === "signup" ? "Create an account" : "Sign in"}
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoFocus
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />

        {mode !== "magic" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        )}

        {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {status === "loading" ? "Please wait…" : mode === "signup" ? "Create account" : mode === "magic" ? "Send magic link" : "Sign in"}
        </button>

        <div className="flex flex-col gap-1 text-center text-xs text-slate-500">
          {mode !== "signin" && (
            <button type="button" onClick={() => { setMode("signin"); setErrorMsg(""); }} className="hover:text-brand-700">
              Sign in with password
            </button>
          )}
          {mode !== "signup" && (
            <button type="button" onClick={() => { setMode("signup"); setErrorMsg(""); }} className="hover:text-brand-700">
              Create an account
            </button>
          )}
          {mode !== "magic" && (
            <button type="button" onClick={() => { setMode("magic"); setErrorMsg(""); }} className="hover:text-brand-700">
              Email me a magic link
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
