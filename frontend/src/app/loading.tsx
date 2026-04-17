import { SkeletonCard } from "@/components/Loader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero skeleton */}
      <div className="py-16 sm:py-24 flex flex-col items-center gap-4">
        <div className="h-6 w-40 animate-shimmer rounded-full" />
        <div className="h-12 w-80 animate-shimmer rounded-xl" />
        <div className="h-6 w-64 animate-shimmer rounded-lg" />
        <div className="flex gap-3">
          <div className="h-11 w-36 animate-shimmer rounded-xl" />
          <div className="h-11 w-36 animate-shimmer rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="h-8 w-48 animate-shimmer rounded-lg" />
            <div className="mt-2 h-4 w-64 animate-shimmer rounded" />
          </div>
          <div className="h-8 w-20 animate-shimmer rounded-lg" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
