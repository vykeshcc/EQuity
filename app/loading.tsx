import { SkeletonCard } from "@/components/SkeletonCard";

export default function RootLoading() {
  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <div className="animate-pulse h-10 w-2/3 rounded bg-slate-200" />
        <div className="animate-pulse h-5 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
