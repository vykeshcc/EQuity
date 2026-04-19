import { SkeletonCard } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse flex max-w-2xl gap-2">
        <div className="h-10 flex-1 rounded bg-slate-200" />
        <div className="h-10 w-24 rounded bg-slate-100" />
        <div className="h-10 w-20 rounded bg-slate-200" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );
}
