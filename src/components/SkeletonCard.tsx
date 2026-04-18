export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 p-4">
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mt-2 h-3 rounded bg-slate-100" style={{ width: `${60 + i * 10}%` }} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-3 border-b border-slate-100 px-3 py-2">
      <div className="h-7 w-7 rounded-md bg-slate-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-2/3 rounded bg-slate-200" />
        <div className="h-2.5 w-1/3 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 4 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-slate-100" style={{ width: i === lines - 1 ? "55%" : "100%" }} />
      ))}
    </div>
  );
}
