import Link from "next/link";
import { getBook } from "@/lib/api";
import { GenreBadge } from "@/components/Badge";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      {/* ─── Back Button + Header ─── */}
      <div className="animate-fade-in-up mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Genre badge */}
          <div className="mb-3">
            <GenreBadge genre={book.genre} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {book.title}
          </h1>

          {/* Author */}
          <p className="mt-2 flex items-center gap-2 text-base text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
            </svg>
            {book.author}
          </p>

          {/* Rating if available */}
          {typeof book.rating === "number" && (
            <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill={i < Math.round(book.rating!) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="h-4 w-4"
                >
                  <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.58a.75.75 0 0 1-1.12.814L8 11.82l-3.136 1.78a.75.75 0 0 1-1.12-.814l.852-3.58-2.79-2.39a.75.75 0 0 1 .427-1.317l3.664-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                </svg>
              ))}
              <span className="ml-1">{book.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted shadow-sm transition-all duration-200 hover:border-border-hover hover:text-foreground hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
      </div>

      {/* ─── Description Section ─── */}
      <section className="animate-fade-in-up delay-100 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-accent">
            <path d="M7.05 3.293a.75.75 0 0 1 1.06 0L13.364 8.55a.75.75 0 0 1 0 1.06l-5.253 5.254a.75.75 0 0 1-1.061-1.06l4.722-4.723-4.722-4.723a.75.75 0 0 1 0-1.06Z" />
            <path d="M3.293 3.293a.75.75 0 0 1 1.06 0L9.608 8.55a.75.75 0 0 1 0 1.06L4.354 14.864a.75.75 0 0 1-1.06-1.06L7.94 9.08 3.293 4.353a.75.75 0 0 1 0-1.06Z" />
          </svg>
          Description
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-foreground">
          {book.description || (
            <span className="italic text-muted">No description available for this book.</span>
          )}
        </p>
        {book.book_url ? (
          <a
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-hover"
            href={book.book_url}
            target="_blank"
            rel="noreferrer"
          >
            View source page
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
            </svg>
          </a>
        ) : null}
      </section>

      {/* ─── AI Summary + Recommendations ─── */}
      <div className="animate-fade-in-up delay-200 mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* AI Summary */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-6 shadow-sm dark:from-emerald-500/5 dark:to-teal-500/5">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
          <h2 className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M7.25 3.688a8.034 8.034 0 0 0-4.872.604.75.75 0 0 0-.378.65v7.216a.75.75 0 0 0 1.128.648 6.554 6.554 0 0 1 4.122-.6V3.688ZM8.75 11.206a6.555 6.555 0 0 1 4.122.6.75.75 0 0 0 1.128-.648V3.942a.75.75 0 0 0-.378-.65 8.034 8.034 0 0 0-4.872-.604v8.518Z" />
            </svg>
            AI Summary
          </h2>
          <p className="relative mt-4 text-sm leading-8 text-foreground">
            {book.summary || (
              <span className="italic text-muted">No AI summary available yet.</span>
            )}
          </p>
        </section>

        {/* Recommended Books */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-accent">
              <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 1 4 2.5h8A1.5 1.5 0 0 1 13.5 4v1.879a3 3 0 0 1 0 4.243V12.5A1.5 1.5 0 0 1 12 14H4a1.5 1.5 0 0 1-1.5-1.5v-2.378a3 3 0 0 1 0-4.243V4Zm1.5 7.5v-1.401a3.013 3.013 0 0 0 1.5 0V11.5h5v-1.401A3.013 3.013 0 0 0 12 10.1v1.4h-8Z" clipRule="evenodd" />
            </svg>
            Recommended Books
          </h2>

          {book.recommended_books?.length ? (
            <ul className="mt-4 space-y-3">
              {book.recommended_books.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/books/${r.id}`}
                    className="group block rounded-xl border border-border bg-surface-hover p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:shadow-md"
                  >
                    <span className="text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-accent">
                      {r.title}
                    </span>
                    {r.snippet ? (
                      <p className="mt-1 text-xs leading-relaxed text-muted">{r.snippet}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm italic text-muted">No recommendations available.</p>
          )}
        </section>
      </div>

      {/* ─── Ask AI CTA ─── */}
      <div className="animate-fade-in-up delay-300 mt-8 flex items-center justify-center">
        <Link
          href="/qa"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
        >
          Ask AI about this book
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
