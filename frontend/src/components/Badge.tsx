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
    return "bg-purple-50 text-purple-700 ring-purple-600/20";
  }
  if (g.includes("thriller")) {
    return "bg-red-50 text-red-700 ring-red-600/20";
  }
  if (g.includes("self-help") || g.includes("self help")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }
  if (g.includes("business")) {
    return "bg-blue-50 text-blue-700 ring-blue-600/20";
  }

  return "bg-zinc-100 text-zinc-700 ring-zinc-500/20";
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

  return "Unknown";
}

export function GenreBadge({ genre, className = "" }: GenreBadgeProps) {
  const label = normalizeGenre(genre);
  const color = getGenreClasses(label);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${color} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
