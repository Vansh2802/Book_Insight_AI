#!/usr/bin/env python
"""
Django entrypoint.

Quickstart:
  - Install deps: pip install -r requirements.txt
  - Migrate:      python manage.py makemigrations && python manage.py migrate
  - Run server:   python manage.py runserver

API:
  - POST /api/books/upload/ triggers scraping + saving into SQLite.
"""

import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "book_ai_backend.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()

