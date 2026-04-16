# Book Insight AI Platform

An AI-powered book discovery and Q&A platform built with Django, ChromaDB, and Next.js.
It scrapes books, indexes descriptions into a Retrieval-Augmented Generation (RAG) pipeline, and answers user questions with structured source citations.

## Project Overview

Book Insight AI helps users:
- Browse scraped books with clean, responsive cards
- Open detailed pages with AI summary and recommendations
- Ask natural-language questions grounded in indexed book descriptions
- See structured citations (book title + relevant snippet) with each answer

The backend uses semantic search over chunked descriptions and an LLM for grounded responses.
The frontend provides a polished UX with loading states, source cards, and sample prompt shortcuts.

## Features

- AI Q&A with RAG over your own book dataset
- Structured citations for each answer:
  - title
  - snippet (trimmed, clean, deduplicated)
- Response caching for repeated questions (in-memory, TTL-based)
- Improved chunking quality:
  - chunk size around 300-500 chars
  - overlap (~50 chars)
  - filters empty and very short chunks
- Frontend UX improvements:
  - Thinking/loading indicator while generating answers
  - sample question chips
  - responsive cards and cleaner layout
  - friendlier error messages

## Tech Stack

Backend:
- Python 3.12+
- Django + Django REST Framework
- ChromaDB
- sentence-transformers
- OpenAI-compatible client (OpenAI or LM Studio)

Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Data:
- SQLite (default local DB)

## Setup Instructions

## 1. Clone and Enter Project

```bash
git clone https://github.com/Vansh2802/Book_Insight_AI.git
cd Book_Insight_AI
```

## 2. Backend Setup (Django)

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations books
python manage.py migrate
python manage.py runserver
```

Backend runs at:
- http://127.0.0.1:8000

## 3. Frontend Setup (Next.js)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at:
- http://localhost:3000

## 4. Configure LLM (Optional but Recommended)

Environment variables can be set for backend runtime:
- `OPENAI_API_KEY`
- `LLM_PROVIDER` (`openai` or `lmstudio`)
- `LLM_MODEL`
- `LLM_BASE_URL` (for LM Studio / OpenAI-compatible local endpoint)

Optional cache and vector config:
- `QA_CACHE_TTL_SECONDS` (default: 900)
- `CHROMA_PATH`
- `CHROMA_COLLECTION`
- `EMBED_MODEL`

## 5. Build Index Data

After scraping/importing books, call:

```http
POST /api/books/upload/
```

This will scrape books and refresh vector index chunks.

## API Endpoints

- `GET /api/books/`
  - List all books
- `GET /api/books/<id>/`
  - Get book detail + summary + recommendations
- `POST /api/books/upload/`
  - Trigger scraper + rebuild RAG index
- `POST /api/books/ask/`
  - Ask a question grounded in indexed descriptions
  - Request body:

```json
{
  "question": "What is this book about?"
}
```

Successful response example:

```json
{
  "answer": "This book focuses on ...",
  "sources": [
    {
      "title": "The Midnight Library",
      "snippet": "Nora explores parallel lives and choices across different realities..."
    },
    {
      "title": "Project Hail Mary",
      "snippet": "A lone astronaut wakes up with memory loss and must save humanity..."
    }
  ],
  "cached": false
}
```

Error response examples:

```json
{
  "answer": "",
  "sources": [],
  "error": "Empty question."
}
```

```json
{
  "answer": "",
  "sources": [],
  "error": "No relevant results found for this question."
}
```

## Sample Q&A

Question:
- "What is this book about?"

Sample answer:
- "The book centers on a protagonist facing emotional and practical conflicts, with the plot exploring personal growth and difficult choices."

Sample sources:
- Title: The Midnight Library
  - Snippet: "Nora explores alternate versions of her life, reflecting on regret, identity, and meaning..."
- Title: The Alchemist
  - Snippet: "A shepherd embarks on a journey to discover his personal legend and purpose..."

Question:
- "Recommend similar books"

Sample answer:
- "If you liked this theme, you may enjoy character-driven journeys with introspective themes and transformative arcs."

## Screenshots

Add screenshots in a future update (placeholders):
- `docs/screenshots/home.png`
- `docs/screenshots/book-detail.png`
- `docs/screenshots/qa.png`

## Bonus Features

- In-memory Q&A cache with TTL:
  - Key: normalized user question
  - Value: answer + structured sources + timestamp
  - Repeated questions can return faster cached responses

## Notes for Production

- Replace in-memory cache with Redis for multi-instance deployments
- Add monitoring/logging and request tracing
- Add retry/fallback strategy for LLM provider outages
- Add authentication and rate limiting for public API exposure
