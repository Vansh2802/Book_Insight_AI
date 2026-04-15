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
from typing import Iterable, List, Optional, Dict, Any
import hashlib
import os

from .models import Book


DEFAULT_COLLECTION = os.environ.get("CHROMA_COLLECTION", "book_chunks")
DEFAULT_CHROMA_PATH = os.environ.get("CHROMA_PATH", "chroma_db")
DEFAULT_EMBED_MODEL = os.environ.get("EMBED_MODEL", "all-MiniLM-L6-v2")

LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "openai").lower().strip()  # openai | lmstudio
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4o-mini")
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "").strip()  # used for lmstudio (OpenAI-compatible)


_model = None


def _get_model():
    # Lazy import so Django can start without heavy deps installed yet.
    from sentence_transformers import SentenceTransformer  # type: ignore

    global _model
    if _model is None:
        _model = SentenceTransformer(DEFAULT_EMBED_MODEL)
    return _model


def _get_collection():
    import chromadb  # type: ignore

    client = chromadb.PersistentClient(path=DEFAULT_CHROMA_PATH)
    return client.get_or_create_collection(name=DEFAULT_COLLECTION)


def chunk_text(text: str, min_len: int = 300, max_len: int = 500, overlap: int = 60) -> List[str]:
    """
    Chunk text by character length. Keeps it simple and deterministic.
    """
    t = (text or "").strip()
    if not t:
        return []

    chunks: List[str] = []
    i = 0
    n = len(t)
    step = max(1, max_len - overlap)
    while i < n:
        chunk = t[i : i + max_len].strip()
        if len(chunk) >= min_len or (i + max_len >= n and len(chunk) > 0):
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
    chunks = chunk_text(book.description)
    if not chunks:
        return 0

    embeddings = embed_texts(chunks)
    collection = _get_collection()

    ids = [_stable_chunk_id(book.id, i, c) for i, c in enumerate(chunks)]
    metadatas = [{"book_id": book.id, "title": book.title} for _ in chunks]

    # Upsert requires Chroma >= 0.5. If older, replace with add() and catch duplicates.
    collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)
    return len(chunks)


def index_all_books() -> int:
    total = 0
    for b in Book.objects.all().only("id", "title", "description"):
        total += index_book(b)
    return total


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


def _llm_client():
    """
    Returns an OpenAI-compatible client.

    Providers:
      - openai: requires OPENAI_API_KEY
      - lmstudio: set LLM_BASE_URL (e.g. http://localhost:1234/v1) and any dummy OPENAI_API_KEY
    """
    from openai import OpenAI  # type: ignore

    if LLM_PROVIDER == "lmstudio":
        base_url = LLM_BASE_URL or "http://localhost:1234/v1"
        api_key = os.environ.get("OPENAI_API_KEY", "lmstudio")
        return OpenAI(base_url=base_url, api_key=api_key)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set. Set it or use LLM_PROVIDER=lmstudio with LLM_BASE_URL.")
    return OpenAI(api_key=api_key)


def _build_context(chunks: List[SimilarBookChunk]) -> tuple[str, List[str]]:
    sources: List[str] = []
    parts: List[str] = []
    for i, c in enumerate(chunks, start=1):
        snippet = (c.description_chunk or "")[:240].strip()
        sources.append(c.title or snippet or f"Book {c.book_id}")
        parts.append(f"[{i}] Title: {c.title}\nChunk: {c.description_chunk}")
    return "\n\n".join(parts).strip(), sources


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

    matches = search_similar_books(q, top_k=3)
    if not matches:
        return {"answer": "No relevant matches found in the book database.", "sources": []}

    context, sources = _build_context(matches)
    if not context:
        return {"answer": "No usable context found (empty descriptions).", "sources": []}

    system = (
        "You are a helpful assistant for a Book Insight Platform. "
        "Answer using ONLY the provided context. "
        "If the context doesn't contain enough information, say so."
    )
    user = f"Context:\n{context}\n\nQuestion: {q}\n\nReturn a concise answer grounded in the context."

    client = _llm_client()
    resp = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.2,
    )
    answer = (resp.choices[0].message.content or "").strip()
    return {"answer": answer, "sources": sources}

