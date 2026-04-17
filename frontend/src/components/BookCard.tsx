import Link from "next/link";
import type { Book } from "@/lib/api";
import { GenreBadge } from "@/components/Badge";
import { Card } from "@/components/Card";

function shortText(s: string, max = 120) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max).trim()}…` : t;
}

export function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group block transition-all duration-200 active:scale-[0.98]"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <Card className="relative min-h-60 overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-border-hover">
        {/* Gradient overlay on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-300/10 via-transparent to-teal-300/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-400/5 dark:to-teal-400/5" />

        <div className="relative z-10 flex h-full flex-1 flex-col">
          {/* Title + badge row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-accent">
                {book.title}
              </h3>
              <p className="mt-1 truncate text-sm text-muted">{book.author}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <GenreBadge genre={book.genre} />
              {typeof book.rating === "number" ? (
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.58a.75.75 0 0 1-1.12.814L8 11.82l-3.136 1.78a.75.75 0 0 1-1.12-.814l.852-3.58-2.79-2.39a.75.75 0 0 1 .427-1.317l3.664-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                  </svg>
                  {book.rating.toFixed(1)}
                </div>
              ) : null}
            </div>
          </div>

          {/* Description */}
          {book.description ? (
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              {shortText(book.description)}
            </p>
          ) : (
            <p className="mt-3 flex-1 text-sm italic text-muted/60">No description available.</p>
          )}

          {/* Footer CTA */}
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted transition-colors duration-200 group-hover:text-accent">
            View details
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5">
              <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
}
