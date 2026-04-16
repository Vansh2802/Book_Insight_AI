"""
RAG utilities (embeddings + ChromaDB) with optional LLM answering.

What this does:
  - Chunk each book description into ~300–500 char chunks
  - Embed chunks with sentence-transformers
  - Store embeddings in a persistent ChromaDB collection
  - Query top-k similar chunks for a user query

Manual test (after you have books in DB):
  - python manage.py shell
  - from books.rag import index_all_books, search_similar_books, answer_question
  - index_all_books()
  - search_similar_books("space travel mystery")
  - answer_question("Which books mention travel or journeys?")
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Iterable, List, Dict, Any, Sequence
import hashlib
import os
import re

from dotenv import load_dotenv
from anthropic import Anthropic

from .models import Book

load_dotenv()


DEFAULT_COLLECTION = os.environ.get("CHROMA_COLLECTION", "book_chunks")
DEFAULT_CHROMA_PATH = os.environ.get("CHROMA_PATH", "chroma_db")
DEFAULT_EMBED_MODEL = os.environ.get("EMBED_MODEL", "all-MiniLM-L6-v2")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "claude-3-haiku-20240307")
client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


_model = None

CHUNK_MIN_LEN = 300
CHUNK_MAX_LEN = 450
CHUNK_OVERLAP = 50
MIN_INDEXABLE_CHUNK_LEN = 120
SOURCE_SNIPPET_MAX_LEN = 180
QA_CACHE_TTL_SECONDS = int(os.environ.get("QA_CACHE_TTL_SECONDS", "900"))

# In-memory cache for Q&A responses, keyed by normalized question.
_qa_cache: Dict[str, Dict[str, Any]] = {}


def _get_model():
    # Lazy import so Django can start without heavy deps installed yet.
    from sentence_transformers import SentenceTransformer  # type: ignore

    global _model
    if _model is None:
        _model = SentenceTransformer(DEFAULT_EMBED_MODEL)
    return _model


def _get_collection():
    import chromadb  # type: ignore
    from chromadb.config import Settings  # type: ignore

    def _client(path: str):
        return chromadb.PersistentClient(
            path=path,
            settings=Settings(anonymized_telemetry=False),
        )

    try:
        return _client(DEFAULT_CHROMA_PATH).get_or_create_collection(name=DEFAULT_COLLECTION)
    except KeyError as exc:
        # This can happen when an existing on-disk Chroma DB was created by an older
        # Chroma version and the internal config schema is incompatible.
        if str(exc) != "'_type'":
            raise

        fallback_path = os.environ.get("CHROMA_PATH_FALLBACK", f"{DEFAULT_CHROMA_PATH}_v2")
        print(
            f"[chroma] Existing DB at '{DEFAULT_CHROMA_PATH}' is incompatible (missing _type). "
            f"Using fresh DB at '{fallback_path}'."
        )
        return _client(fallback_path).get_or_create_collection(name=DEFAULT_COLLECTION)


def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def _is_indexable_text(text: str) -> bool:
    return len(_clean_text(text)) >= MIN_INDEXABLE_CHUNK_LEN


def _trim_snippet(text: str, max_len: int = SOURCE_SNIPPET_MAX_LEN) -> str:
    cleaned = _clean_text(text)
    if len(cleaned) <= max_len:
        return cleaned
    cut = cleaned[:max_len].rsplit(" ", 1)[0].strip()
    return f"{cut or cleaned[:max_len].strip()}..."


def _cache_key(question: str) -> str:
    return _clean_text(question).lower()


def _get_cached_answer(question: str) -> Dict[str, Any] | None:
    key = _cache_key(question)
    if not key:
        return None

    entry = _qa_cache.get(key)
    if not entry:
        return None

    expires_at = entry["expires_at"]
    if datetime.now(timezone.utc) > expires_at:
        _qa_cache.pop(key, None)
        return None

    return {
        "answer": entry["answer"],
        "sources": entry["sources"],
        "cached": True,
        "cached_at": entry["cached_at"],
    }


def _set_cached_answer(question: str, answer: str, sources: List[Dict[str, str]]) -> None:
    key = _cache_key(question)
    if not key:
        return

    now = datetime.now(timezone.utc)
    _qa_cache[key] = {
        "answer": answer,
        "sources": sources,
        "cached_at": now.isoformat(),
        "expires_at": now + timedelta(seconds=QA_CACHE_TTL_SECONDS),
    }


def chunk_text(
    text: str,
    min_len: int = CHUNK_MIN_LEN,
    max_len: int = CHUNK_MAX_LEN,
    overlap: int = CHUNK_OVERLAP,
) -> List[str]:
    """
    Chunk text by character length. Keeps it simple and deterministic.
    """
    t = _clean_text(text)
    if not t:
        return []

    chunks: List[str] = []
    i = 0
    n = len(t)
    step = max(1, max_len - overlap)
    while i < n:
        chunk = _clean_text(t[i : i + max_len])
        if len(chunk) < MIN_INDEXABLE_CHUNK_LEN:
            i += step
            continue

        if len(chunk) >= min_len or (i + max_len >= n and len(chunk) >= MIN_INDEXABLE_CHUNK_LEN):
            chunks.append(chunk)
        i += step
    return chunks


def embed_texts(texts: Iterable[str]) -> List[List[float]]:
    model = _get_model()
    vectors = model.encode(list(texts), normalize_embeddings=True)
    return vectors.tolist()


def _stable_chunk_id(book_id: int, chunk_index: int, chunk: str) -> str:
    h = hashlib.sha1(chunk.encode("utf-8")).hexdigest()[:16]
    return f"book:{book_id}:chunk:{chunk_index}:{h}"


def index_book(book: Book) -> int:
    """
    Index a single book's description chunks into ChromaDB.
    Uses deterministic IDs so re-indexing overwrites logically.
    """
    description = _clean_text(book.description)
    if not _is_indexable_text(description):
        return 0

    chunks = chunk_text(description)
    if not chunks:
        return 0

    embeddings = embed_texts(chunks)
    collection = _get_collection()

    ids = [_stable_chunk_id(book.id, i, c) for i, c in enumerate(chunks)]
    metadatas = [{"book_id": book.id, "title": book.title} for _ in chunks]

    # Upsert requires Chroma >= 0.5. If older, replace with add() and catch duplicates.
    collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)
    return len(chunks)


def index_books(books: Sequence[Book] | Iterable[Book]) -> int:
    """
    Index a collection of books while skipping duplicates and non-indexable descriptions.
    """
    total = 0
    seen_ids: set[int] = set()
    for book in books:
        if book.id in seen_ids:
            continue
        seen_ids.add(book.id)
        total += index_book(book)
    return total


def index_all_books() -> int:
    books = Book.objects.exclude(description__isnull=True).exclude(description__exact="").only("id", "title", "description")
    return index_books(books)


@dataclass
class SimilarBookChunk:
    title: str
    description_chunk: str
    book_id: int
    distance: float


def search_similar_books(query: str, top_k: int = 3) -> List[SimilarBookChunk]:
    """
    Convert query into an embedding, retrieve top_k similar chunks, and return
    matched book titles + description chunks.
    """
    q = (query or "").strip()
    if not q:
        return []

    collection = _get_collection()
    q_emb = embed_texts([q])[0]
    res = collection.query(query_embeddings=[q_emb], n_results=top_k, include=["documents", "metadatas", "distances"])

    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    dists = (res.get("distances") or [[]])[0]

    out: List[SimilarBookChunk] = []
    for doc, meta, dist in zip(docs, metas, dists):
        out.append(
            SimilarBookChunk(
                title=str(meta.get("title", "")),
                description_chunk=str(doc),
                book_id=int(meta.get("book_id", 0)),
                distance=float(dist),
            )
        )
    return out


def _anthropic_client() -> Anthropic | None:
    return client


def _build_context(chunks: List[SimilarBookChunk]) -> tuple[str, List[Dict[str, str]]]:
    seen_books: set[int] = set()
    sources: List[Dict[str, str]] = []
    parts: List[str] = []
    for c in chunks:
        if c.book_id in seen_books:
            continue

        snippet = _trim_snippet(c.description_chunk)
        if not snippet:
            continue

        seen_books.add(c.book_id)
        title = (c.title or f"Book {c.book_id}").strip()
        sources.append({"title": title, "snippet": snippet})
        parts.append(f"Title: {title}\nChunk: {c.description_chunk}")

    numbered_parts = [f"[{i}] {part}" for i, part in enumerate(parts, start=1)]

    return "\n\n".join(numbered_parts).strip(), sources


def answer_question(query: str) -> Dict[str, Any]:
    """
    Real RAG:
      - embed query
      - retrieve top 3 chunks from ChromaDB
      - send context + question to LLM
      - return answer + sources
    """
    q = (query or "").strip()
    if not q:
        return {"answer": "", "sources": [], "error": "Empty question."}

    if not ANTHROPIC_API_KEY:
        print("[rag] ANTHROPIC_API_KEY missing; cannot generate answer")
        return {
            "answer": "",
            "sources": [],
            "error": "ANTHROPIC_API_KEY is not configured. Add it to your environment or .env file.",
        }

    print(f"[rag] Answering question: {q[:120]}")

    cached = _get_cached_answer(q)
    if cached:
        print("[rag] Cache hit")
        return cached

    matches = search_similar_books(q, top_k=6)
    print(f"[rag] Retrieved chunks: {len(matches)}")
    if not matches:
        return {"answer": "", "sources": [], "error": "No relevant results found for this question."}

    context, sources = _build_context(matches)
    if not context:
        return {"answer": "", "sources": [], "error": "No usable context found in indexed book descriptions."}

    anthropic_client = _anthropic_client()
    if anthropic_client is None:
        print("[rag] Anthropic client initialization failed")
        return {
            "answer": "",
            "sources": [],
            "error": "Anthropic client could not be initialized. Check ANTHROPIC_API_KEY configuration.",
        }

    try:
        model = os.getenv('LLM_MODEL', 'claude-3-haiku-20240307')
        print(f"[rag] Sending prompt to Anthropic model: {model}")
        response = anthropic_client.messages.create(
            model=model,
            max_tokens=1024,
            system="You are a helpful AI assistant answering questions about books.",
            messages=[
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion:\n{q}",
                },
            ],
            temperature=0.3,
        )
        answer = (response.content[0].text or "").strip()
    except Exception as exc:
        print(f"[rag] Anthropic request failed: {exc}")
        return {
            "answer": "",
            "sources": sources,
            "error": f"Anthropic API request failed: {exc}",
        }

    if not answer:
        return {"answer": "", "sources": sources, "error": "LLM returned an empty answer."}

    print(f"[rag] Generated answer length: {len(answer)}")
    _set_cached_answer(q, answer, sources)
    return {"answer": answer, "sources": sources}

