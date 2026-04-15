"""
AI-powered insights for books.

Functions:
  - generate_summary(book): short LLM summary of the book description
  - recommend_books(book_id): embedding-based recommendations (top 3)
"""

from __future__ import annotations

from typing import Any, Dict, List

from .models import Book
from .rag import search_similar_books, _llm_client, LLM_MODEL, index_all_books


def generate_summary(book: Book) -> str:
    """
    Generate a short summary grounded only in the book's description.
    """
    desc = (book.description or "").strip()
    if not desc:
        return ""

    system = "You write concise, helpful summaries for a book platform."
    user = (
        "Summarize the following book description in 2-3 sentences. "
        "If it lacks details, keep the summary short.\n\n"
        f"Description:\n{desc}"
    )

    client = _llm_client()
    resp = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.3,
    )
    return (resp.choices[0].message.content or "").strip()


def recommend_books(book_id: int) -> List[Dict[str, Any]]:
    """
    Recommend top 3 similar books based on embedding similarity.
    Uses ChromaDB chunks and returns unique books (excluding the input book).
    """
    book = Book.objects.filter(id=book_id).only("id", "title", "description").first()
    if not book or not (book.description or "").strip():
        return []

    # Ensure some index exists. If the DB is empty this is cheap; otherwise it indexes all.
    # For a production system you'd do incremental indexing in a background job.
    index_all_books()

    # Query more chunks than needed, then dedupe by book_id.
    matches = search_similar_books(book.description, top_k=12)
    seen = {book.id}
    recs: List[Dict[str, Any]] = []
    for m in matches:
        if m.book_id in seen:
            continue
        seen.add(m.book_id)
        recs.append({"id": m.book_id, "title": m.title, "snippet": m.description_chunk[:200].strip()})
        if len(recs) >= 3:
            break
    return recs

