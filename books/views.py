from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
import traceback

from .models import Book
from .serializers import BookSerializer


class BookListView(generics.ListAPIView):
    """
    GET /api/books/
    Returns all books.
    """

    queryset = Book.objects.all().order_by("-created_at")
    serializer_class = BookSerializer


class BookDetailView(generics.RetrieveAPIView):
    """
    GET /api/books/<id>/
    Returns a single book by id.
    """

    queryset = Book.objects.all()
    serializer_class = BookSerializer
    lookup_field = "id"

    def retrieve(self, request, *args, **kwargs):
        book = self.get_object()
        data = BookSerializer(book).data

        # Lazy import: only needed for this endpoint.
        from .ai_insights import generate_summary, recommend_books, generate_genre

        # 1. Check if genre missing, generate once and save
        if not book.genre:
            try:
                new_genre = generate_genre(book.description)
                book.genre = new_genre
                book.save(update_fields=["genre"])
                data["genre"] = new_genre
            except Exception as e:
                print(f"Failed to generate genre: {e}")
                data["genre"] = "Unknown"

        try:
            data["summary"] = generate_summary(book)
        except Exception:
            data["summary"] = ""

        try:
            data["recommended_books"] = recommend_books(book.id)
        except Exception:
            data["recommended_books"] = []

        return Response(data, status=status.HTTP_200_OK)


class BookUploadView(APIView):
    """
    POST /api/books/upload/
    Triggers scraping and then indexes all book descriptions into ChromaDB.
    """

    def post(self, request):
        try:
            # Optional override: {"target_count": 30}
            target_count = request.data.get("target_count", 30) if isinstance(request.data, dict) else 30

            print("[upload] Scraping started")

            # Lazy import so the server can start even if optional deps aren't installed yet.
            from .scraper import run_scraper
            from .rag import index_books

            scrape_stats = run_scraper(target_count=int(target_count))
            print(f"[upload] Scraping finished: {scrape_stats}")

            books = (
                Book.objects.exclude(description__isnull=True)
                .exclude(description__exact="")
                .only("id", "title", "description")
            )
            books_to_index = list(books)
            print(f"[upload] Books available for indexing: {len(books_to_index)}")

            indexed_chunks = index_books(books_to_index)
            print(f"[upload] Embeddings created: {indexed_chunks}")

            created_count = int(scrape_stats.get("created", 0))
            return Response(
                {
                    "message": "Books uploaded and indexed successfully",
                    "count": created_count,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            print("[upload] Failed during upload")
            traceback.print_exc()
            return Response(
                {"error": f"Upload failed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BookAskView(APIView):
    """
    POST /api/books/ask/
    Body: {"question": "..."}
    Returns: {"answer": "...", "sources": [...]}
    """

    def post(self, request):
        question = ""
        if isinstance(request.data, dict):
            question = str(request.data.get("question", "")).strip()

        if not question:
            return Response({"answer": "", "sources": [], "error": "Empty question."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from .rag import answer_question

            # Always return a JSON payload (HTTP 200) so the frontend can display
            # a clean error message from `result.error` without treating it as a network failure.
            result = answer_question(question)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as exc:
            traceback.print_exc()
            return Response({"answer": "", "sources": [], "error": f"Failed to answer question: {exc}"}, status=status.HTTP_200_OK)

