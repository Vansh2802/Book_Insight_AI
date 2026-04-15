"""
WSGI config for book_ai_backend.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "book_ai_backend.settings")

application = get_wsgi_application()

