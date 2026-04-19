"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <p className="text-slate-600">Failed to load peptides.</p>
      <button onClick={reset} className="text-sm text-brand-700 hover:underline">Retry</button>
    </div>
  );
}
