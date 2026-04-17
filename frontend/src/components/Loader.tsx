export function LoadingDots({ text = "Thinking" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted">
      <span className="inline-flex items-center gap-1" aria-label={text}>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
      </span>
      <span>{text}...</span>
    </div>
  );
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
  };
  return (
    <div
      className={`animate-spin rounded-full border-accent/30 border-t-accent ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 w-3/4 animate-shimmer rounded-lg" />
          <div className="mt-2 h-4 w-1/3 animate-shimmer rounded-lg" />
        </div>
        <div className="h-6 w-16 animate-shimmer rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-shimmer rounded" />
        <div className="h-3 w-5/6 animate-shimmer rounded" />
        <div className="h-3 w-2/3 animate-shimmer rounded" />
      </div>
      <div className="mt-5 h-4 w-24 animate-shimmer rounded" />
    </div>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />;
}

export function EmptyState({
  icon = "📭",
  title = "No results yet",
  description = "Try a different query or come back later.",
}: {
  icon?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
