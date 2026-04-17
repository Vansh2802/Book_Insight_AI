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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {book.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">{book.author}</p>
          <div className="mt-2">
            <GenreBadge genre={book.genre} />
          </div>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          ← Back
        </Link>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
          {book.description || "No description available."}
        </p>
        {book.book_url ? (
          <a
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
            href={book.book_url}
            target="_blank"
            rel="noreferrer"
          >
            Source page →
          </a>
        ) : null}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">AI summary</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            {book.summary || "No summary available."}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recommended books
          </h2>
          {book.recommended_books?.length ? (
            <ul className="mt-3 space-y-3">
              {book.recommended_books.map((r) => (
                <li key={r.id} className="text-sm">
                  <Link
                    href={`/books/${r.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {r.title}
                  </Link>
                  {r.snippet ? (
                    <div className="mt-1 text-xs leading-5 text-zinc-600">
                      {r.snippet}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">
              No recommendations available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

