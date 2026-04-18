"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/evals";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = `admin_token=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
    // Verify by attempting to navigate — middleware will redirect back here if wrong.
    router.push(next);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Admin access</h1>
        <input
          type="password"
          value={token}
          onChange={(e) => { setToken(e.target.value); setError(false); }}
          placeholder="Admin token"
          required
          autoFocus
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        {error && <p className="text-xs text-red-600">Invalid token.</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
