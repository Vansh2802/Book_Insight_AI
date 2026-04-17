type GenreBadgeProps = {
  genre?: string | null;
  className?: string;
};

function normalizeGenre(genre?: string | null): string {
  return (genre || "Unknown").trim();
}

function getGenreClasses(genre?: string | null): string {
  const g = normalizeGenre(genre).toLowerCase();

  if (g.includes("fiction")) {
    return "bg-purple-100 text-purple-700 ring-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/30";
  }
  if (g.includes("thriller") || g.includes("mystery") || g.includes("crime")) {
    return "bg-red-100 text-red-700 ring-red-500/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/30";
  }
  if (g.includes("self-help") || g.includes("self help") || g.includes("motivation")) {
    return "bg-emerald-100 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30";
  }
  if (g.includes("business") || g.includes("finance") || g.includes("entrepreneur")) {
    return "bg-blue-100 text-blue-700 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30";
  }
  if (g.includes("romance")) {
    return "bg-pink-100 text-pink-700 ring-pink-500/20 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-400/30";
  }
  if (g.includes("science") || g.includes("tech")) {
    return "bg-indigo-100 text-indigo-700 ring-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/30";
  }
  if (g.includes("history")) {
    return "bg-amber-100 text-amber-700 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30";
  }

  return "bg-zinc-100 text-zinc-600 ring-zinc-500/15 dark:bg-zinc-700/40 dark:text-zinc-300 dark:ring-zinc-500/30";
}

export function inferGenreFromText(text: string): string {
  const source = (text || "").toLowerCase();

  if (source.includes("thriller") || source.includes("mystery") || source.includes("crime")) {
    return "Thriller";
  }
  if (source.includes("business") || source.includes("startup") || source.includes("entrepreneur")) {
    return "Business";
  }
  if (source.includes("self-help") || source.includes("habit") || source.includes("motivation")) {
    return "Self-help";
  }
  if (source.includes("novel") || source.includes("story") || source.includes("fiction")) {
    return "Fiction";
  }
  if (source.includes("romance") || source.includes("love")) {
    return "Romance";
  }
  if (source.includes("science") || source.includes("tech")) {
    return "Science";
  }
  if (source.includes("history") || source.includes("historical")) {
    return "History";
  }

  return "General";
}

export function GenreBadge({ genre, className = "" }: GenreBadgeProps) {
  const label = normalizeGenre(genre);
  const color = getGenreClasses(label);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset transition-all duration-200 ${color} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
