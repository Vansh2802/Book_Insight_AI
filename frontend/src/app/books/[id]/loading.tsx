export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded bg-zinc-200" />

      <div className="mt-8 h-56 animate-pulse rounded-xl border border-zinc-200 bg-white" />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl border border-zinc-200 bg-white" />
        <div className="h-40 animate-pulse rounded-xl border border-zinc-200 bg-white" />
      </div>
    </div>
  );
}

