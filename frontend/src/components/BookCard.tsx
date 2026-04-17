import Link from "next/link";
import type { Book } from "@/lib/api";
import { GenreBadge } from "@/components/Badge";
import { Card } from "@/components/Card";

function shortText(s: string, max = 140) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max).trim()}…` : t;
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group block transition-all duration-200 active:scale-[0.99]"
    >
      <Card className="relative min-h-[16rem] overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-teal-200/10 opacity-0 transition-all duration-200 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-zinc-900 transition-all duration-200 group-hover:text-emerald-700">
                {book.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-600">{book.author}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <GenreBadge genre={book.genre} />
              {typeof book.rating === "number" ? (
                <div className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                  £{book.rating.toFixed(2)}
                </div>
              ) : null}
            </div>
          </div>

          {book.description ? (
            <p className="mt-3 flex-1 text-sm leading-7 text-zinc-700">
              {shortText(book.description)}
            </p>
          ) : (
            <p className="mt-3 flex-1 text-sm text-zinc-500">No description available.</p>
          )}

          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 transition-all duration-200 group-hover:text-emerald-700">
            View details →
          </div>
        </div>
      </Card>
    </Link>
  );
}

