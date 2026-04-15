from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

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
        from .ai_insights import generate_summary, recommend_books

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
        # Optional override: {"target_count": 30}
        target_count = request.data.get("target_count", 30) if isinstance(request.data, dict) else 30

        # Lazy import so the server can start even if optional deps aren't installed yet.
        from .scraper import run_scraper
        from .rag import index_all_books

        scrape_stats = run_scraper(target_count=int(target_count))
        indexed_chunks = index_all_books()

        return Response(
            {"message": "Scrape complete and RAG index updated.", "scrape": scrape_stats, "indexed_chunks": indexed_chunks},
            status=status.HTTP_200_OK,
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

        from .rag import answer_question

        try:
            result = answer_question(question)
            status_code = status.HTTP_200_OK if not result.get("error") else status.HTTP_400_BAD_REQUEST
            return Response(result, status=status_code)
        except Exception as exc:
            return Response(
                {"answer": "", "sources": [], "error": f"Failed to answer question: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

