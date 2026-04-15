import { BookCard } from "@/components/BookCard";
import { getBooks } from "@/lib/api";

export default function Home() {
  const booksPromise = getBooks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Books</h1>
        <p className="text-sm text-zinc-600">
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
      <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
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
