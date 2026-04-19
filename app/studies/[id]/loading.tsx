import { SkeletonText } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="animate-pulse h-7 w-3/4 rounded bg-slate-200" />
        <div className="animate-pulse h-4 w-1/3 rounded bg-slate-100" />
      </div>
      <div className="rounded-lg border border-slate-200 p-4">
        <SkeletonText lines={5} />
      </div>
      <div className="rounded-lg border border-slate-200 p-4">
        <SkeletonText lines={8} />
      </div>
    </div>
  );
}
