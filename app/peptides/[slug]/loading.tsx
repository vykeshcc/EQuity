import { SkeletonCard, SkeletonRow, SkeletonText } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <div className="animate-pulse h-9 w-1/2 rounded bg-slate-200" />
        <div className="animate-pulse h-4 w-3/4 rounded bg-slate-100" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 p-4">
          <SkeletonText lines={6} />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
