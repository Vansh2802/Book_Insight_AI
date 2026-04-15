import Link from "next/link";
import type { Book } from "@/lib/api";

function shortText(s: string, max = 140) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max).trim()}…` : t;
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-950">
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">{book.author}</p>
        </div>
        {typeof book.rating === "number" ? (
          <div className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
            £{book.rating.toFixed(2)}
          </div>
        ) : null}
      </div>
      {book.description ? (
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          {shortText(book.description)}
        </p>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">No description available.</p>
      )}
      <div className="mt-4 text-xs font-medium text-zinc-500">
        View details →
      </div>
    </Link>
  );
}

