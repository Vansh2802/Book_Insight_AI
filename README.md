# AI-Powered Book Insight Platform

## Overview
AI-Powered Book Insight Platform is a full-stack application that scrapes books, indexes descriptions into a vector database, and serves AI-powered insights through a clean web interface.

It combines Django REST APIs, Next.js UI, ChromaDB retrieval, and LLM generation to provide grounded answers, summaries, recommendations, and genre classification.

## Features
- Book scraping and persistence into SQLite
- RAG-based question answering over indexed book descriptions
- AI-generated summary for each book detail page
- Similar-book recommendations using semantic search
- Genre Classification (NEW): one-time AI genre tagging and DB persistence

## Tech Stack
- Backend: Django, Django REST Framework
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Relational DB: SQLite
- Vector DB: ChromaDB
- AI/LLM: Anthropic/OpenAI-compatible workflow in app services
- Embeddings: sentence-transformers

## Architecture
- Backend layer:
  - Scraper ingests books and stores them in SQLite
  - RAG service chunks descriptions and stores vectors in ChromaDB
  - API layer serves list/detail/upload/ask endpoints
- Frontend layer:
  - Listing page for all books
  - Detail page with summary, recommendations, and genre
  - Q&A page for natural-language questions over indexed content
- AI pipeline:
  - Retrieve top semantically similar chunks from ChromaDB
  - Build grounded prompt with sources
  - Generate answer from LLM and return with citations

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

## API Endpoints
- GET /api/books/
- GET /api/books/:id
- POST /api/books/upload/
- POST /api/books/ask/

### Sample Payloads
`POST /api/books/upload/`
```json
{
  "target_count": 30
}
```

`POST /api/books/ask/`
```json
{
  "question": "Recommend books like atomic habits"
}
```

## Sample Questions
- Recommend books like atomic habits
- Summarize this book
- Which books mention fiction themes?

## Folder Structure
```text
bookwebsite/
├── book_ai_backend/
├── books/
│   ├── migrations/
│   ├── ai_insights.py
│   ├── models.py
│   ├── serializers.py
│   └── views.py
├── frontend/
│   └── src/
├── manage.py
├── requirements.txt
└── README.md
```

## Screenshots
- Home page: docs/screenshots/home.png
- Book detail page: docs/screenshots/book-detail.png
- Q&A page: docs/screenshots/qa.png

## Repo Cleanup Suggestions
- Keep virtual environments out of version control: `.venv/`, `.venv311/`
- Ignore local DB artifacts: `db.sqlite3`
- Keep only one active vector store directory (prefer `chroma_db_v2/`)
- Do not commit secrets in `.env`
