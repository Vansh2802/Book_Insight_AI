import { SkeletonLine } from "@/components/Loader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header skeleton */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <SkeletonLine className="h-5 w-20 mb-3" />
          <SkeletonLine className="h-10 w-3/4 mt-2" />
          <SkeletonLine className="h-5 w-40 mt-3" />
        </div>
        <SkeletonLine className="h-10 w-20 rounded-xl" />
      </div>

      {/* Description skeleton */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <SkeletonLine className="h-4 w-28 mb-4" />
        <SkeletonLine className="h-3.5 w-full mt-2" />
        <SkeletonLine className="h-3.5 w-5/6 mt-2" />
        <SkeletonLine className="h-3.5 w-full mt-2" />
        <SkeletonLine className="h-3.5 w-4/5 mt-2" />
        <SkeletonLine className="h-3.5 w-2/3 mt-2" />
      </div>

      {/* Two column skeleton */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <SkeletonLine className="h-4 w-24 mb-4" />
          <SkeletonLine className="h-3.5 w-full mt-2" />
          <SkeletonLine className="h-3.5 w-5/6 mt-2" />
          <SkeletonLine className="h-3.5 w-full mt-2" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <SkeletonLine className="h-4 w-32 mb-4" />
          {[1, 2, 3].map((n) => (
            <div key={n} className="mt-3 rounded-xl border border-border p-3">
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="h-3 w-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
