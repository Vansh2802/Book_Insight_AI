"""
AI-powered insights for books.

Functions:
  - generate_summary(book): short LLM summary of the book description
  - recommend_books(book_id): embedding-based recommendations (top 3)
"""

from __future__ import annotations

import re
from typing import Any, Dict, List

from .models import Book
from .rag import search_similar_books, _anthropic_client, LLM_MODEL, index_all_books


ALLOWED_GENRES = [
    "Fiction",
    "Thriller",
    "Romance",
    "Fantasy",
    "Self-help",
    "Business",
    "Sci-Fi",
    "Mystery",
    "Biography",
    "History",
    "Poetry",
    "Young Adult",
    "Non-fiction",
]

_GENRE_NORMALIZATION = {
    "scifi": "Sci-Fi",
    "science fiction": "Sci-Fi",
    "science-fiction": "Sci-Fi",
    "self help": "Self-help",
    "self-help": "Self-help",
    "nonfiction": "Non-fiction",
    "non fiction": "Non-fiction",
    "ya": "Young Adult",
}


def _normalize_genre(raw: str) -> str:
    text = (raw or "").strip().splitlines()[0] if raw else ""
    text = re.sub(r"[^a-zA-Z\- ]", "", text).strip().lower()
    if not text:
        return "Unknown"

    text = _GENRE_NORMALIZATION.get(text, text)
    for genre in ALLOWED_GENRES:
        if text == genre.lower():
            return genre

    return "Unknown"


def generate_genre(description: str) -> str:
    """
    Predict a single, short genre for a book description using the LLM.
    Returns something like 'Sci-Fi' or 'Fantasy'.
    """
    desc = (description or "").strip()
    if not desc:
        return "Unknown"

    system = (
        "Classify the book into exactly one genre. "
        "Reply with one label only and no extra text. "
        "Allowed labels: Fiction, Thriller, Romance, Fantasy, Self-help, "
        "Business, Sci-Fi, Mystery, Biography, History, Poetry, Young Adult, Non-fiction."
    )
    user = f"Description:\n{desc[:1800]}"

    client = _anthropic_client()
    if client is None:
        return "Unknown"

    try:
        resp = client.messages.create(
            model=LLM_MODEL,
            max_tokens=8,
            system=system,
            messages=[{"role": "user", "content": user}],
            temperature=0.1,
        )
        return _normalize_genre(resp.content[0].text or "")
    except Exception as exc:
        print(f"[generate_genre] Error: {exc}")
        return "Unknown"


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

    client = _anthropic_client()
    if client is None:
        return ""
    try:
        resp = client.messages.create(
            model=LLM_MODEL,
            max_tokens=300,
            system=system,
            messages=[{"role": "user", "content": user}],
            temperature=0.3,
        )
        return (resp.content[0].text or "").strip()
    except Exception as exc:
        print(f"[generate_summary] Error: {exc}")
        return ""


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

