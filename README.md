# AI-Powered Book Insight Platform

AI-Powered Book Insight Platform is a production-style full-stack project that combines web scraping, retrieval-augmented generation (RAG), and modern frontend UX to make book discovery smarter.

## Overview

This platform lets users:
- Browse a continuously indexable book catalog
- Open rich detail pages with AI-generated summary and recommendations
- Ask grounded natural-language questions over the indexed corpus
- View source-backed answers from the RAG pipeline
- See AI-generated genre classification persisted in the database

## Key Features

- Automated book scraping and ingestion
- RAG Q&A with source citations
- AI-generated short summaries on detail pages
- Semantic recommendation engine for similar books
- Genre Classification (NEW): one-time AI classification and DB persistence
- Responsive, modern Next.js interface with polished Q&A workflow

## Tech Stack

- Backend: Django, Django REST Framework
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Relational Data: SQLite
- Vector Store: ChromaDB
- Embeddings: sentence-transformers
- LLM Integration: Anthropic SDK (configurable model via env)

## High-Level Architecture

1. Scraper ingests books and stores metadata in SQLite.
2. RAG indexer chunks descriptions and stores embeddings in ChromaDB.
3. API layer exposes list/detail/upload/ask endpoints.
4. Q&A endpoint retrieves relevant chunks and generates grounded responses.
5. Detail endpoint enriches response with AI summary, recommendations, and genre.

## Setup Instructions

### Backend

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend URL: http://127.0.0.1:8000

Frontend URL: http://localhost:3000

## Environment Variables

Create a `.env` file in the repository root:

```env
ANTHROPIC_API_KEY=your_api_key
LLM_MODEL=claude-3-haiku-20240307
```

## API Endpoints

- GET `/api/books/`
- GET `/api/books/:id`
- POST `/api/books/upload/`
- POST `/api/books/ask/`

### Sample Requests

POST `/api/books/upload/`

```json
{
  "target_count": 30
}
```

POST `/api/books/ask/`

```json
{
  "question": "Recommend books like atomic habits"
}
```

## Sample Questions

- Recommend books like atomic habits
- Summarize this book
- Which books mention fiction themes?
- List key takeaways from this book

## Project Structure

```text
bookwebsite/
├── book_ai_backend/
├── books/
│   ├── migrations/
│   ├── ai_insights.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── frontend/
│   └── src/
├── manage.py
├── requirements.txt
└── README.md
```

Note: `frontend/README.md` is intentionally a short module note. The root `README.md` is the single source of truth for full project documentation.

## Repo Cleanup Recommendations

- Keep virtual environments out of source control (`.venv/`, `.venv311/`)
- Ignore local DB artifacts (`db.sqlite3`)
- Keep only one active vector store directory (prefer `chroma_db_v2/`)
- Never commit `.env` secrets

## Future Improvements

- Add authentication and user-level Q&A history
- Move long-running scraping/indexing to background jobs (Celery/RQ)
- Add Redis caching for production-scale repeated prompts
- Add CI checks (lint, tests, type-check) and deployment pipeline
