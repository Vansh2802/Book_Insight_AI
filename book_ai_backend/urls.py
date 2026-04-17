from django.contrib import admin
from django.urls import include, path

from .views import home

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include("books.urls")),
]

