import Link from "next/link";
import { BookCard } from "@/components/BookCard";
import { getBooks } from "@/lib/api";
import { EmptyState } from "@/components/Loader";

export default function Home() {
  const booksPromise = getBooks();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/8" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/8" />

        <div className="relative flex flex-col items-center text-center">
          {/* Pill badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            AI-Powered Book Discovery
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-in-up delay-100 max-w-3xl bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-400 sm:text-5xl lg:text-6xl">
            Explore Books{" "}
            <span className="bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              with AI
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-in-up delay-200 mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Search, summarize, and discover insights from every book — powered
            by a RAG pipeline that understands your collection.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/qa"
              className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.03] hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              Start Asking
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <a
              href="#books"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:scale-[1.03] hover:border-border-hover hover:shadow-md active:scale-[0.98]"
            >
              Browse Library
            </a>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-in-up delay-400 mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
            {[
              { icon: "🤖", label: "AI Summaries" },
              { icon: "🔍", label: "RAG Search" },
              { icon: "💡", label: "Smart Recs" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Books Grid ─── */}
      <section id="books" className="pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Book Library
            </h2>
            <p className="mt-1 text-sm text-muted">
              Browse all indexed books — click any for AI summaries and
              recommendations.
            </p>
          </div>
          <Link
            href="/qa"
            className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted transition-all duration-200 hover:border-border-hover hover:text-foreground"
          >
            Ask AI →
          </Link>
        </div>

        <BookGrid booksPromise={booksPromise} />
      </section>
    </div>
  );
}

async function BookGrid({
  booksPromise,
}: {
  booksPromise: ReturnType<typeof getBooks>;
}) {
  const books = await booksPromise;

  if (!books?.length) {
    return (
      <EmptyState
        icon="📚"
        title="No books yet"
        description="Run the backend scraper first via POST /api/books/upload/ to index your library."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((b, i) => (
        <div key={b.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
          <BookCard book={b} index={i} />
        </div>
      ))}
    </div>
  );
}
