import { BookCard } from "@/components/BookCard";
import { getBooks } from "@/lib/api";

export default function Home() {
  const booksPromise = getBooks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Books</h1>
        <p className="max-w-2xl text-sm text-zinc-600 sm:text-base">
          Browse scraped books, open details for AI summary and recommendations.
        </p>
      </div>

      <BookGrid booksPromise={booksPromise} />
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
      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        No books found. Run the backend scraper first via{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5">
          POST /api/books/upload/
        </code>
        .
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}
