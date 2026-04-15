from django.urls import path

from .views import BookAskView, BookDetailView, BookListView, BookUploadView


urlpatterns = [
    path("books/", BookListView.as_view(), name="book-list"),
    path("books/upload/", BookUploadView.as_view(), name="book-upload"),
    path("books/ask/", BookAskView.as_view(), name="book-ask"),
    path("books/<int:id>/", BookDetailView.as_view(), name="book-detail"),
]

