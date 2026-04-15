"""
ASGI config for book_ai_backend.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "book_ai_backend.settings")

application = get_asgi_application()

