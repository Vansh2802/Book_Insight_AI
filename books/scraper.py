"""
BeautifulSoup scraper for http://books.toscrape.com

Usage (after migrations):
  - python manage.py shell
  - from books.scraper import run_scraper
  - run_scraper()

API usage:
  - POST /api/books/upload/ (wired in `books/views.py`) will call run_scraper().
"""

from __future__ import annotations

from typing import Optional
import traceback

from django.db import transaction

from .models import Book


BASE_URL = "http://books.toscrape.com/catalogue/"
FIRST_PAGE_URL = "http://books.toscrape.com/catalogue/page-1.html"


def _clean_text(text: str) -> str:
    return " ".join((text or "").split()).strip()


def _get_soup(url: str, session):
    # Lazy imports so Django can start even before optional deps are installed.
    import requests  # noqa: F401
    from bs4 import BeautifulSoup  # type: ignore

    resp = session.get(url, timeout=20)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def _parse_price_to_float(price_text: str) -> Optional[float]:
    # Handles both "£51.77" and "Â£51.77" encodings.
    t = _clean_text(price_text).replace("Â", "").replace("£", "")
    try:
        return float(t)
    except ValueError:
        return None


def _extract_description(detail_soup) -> str:
    desc_tag = detail_soup.select_one("#product_description ~ p")
    if not desc_tag:
        return "No description available"
    description = _clean_text(desc_tag.get_text(" ", strip=True))
    return description or "No description available"


def run_scraper(target_count: int = 30) -> dict:
    """
    Scrape ~target_count books, visit each detail page for description,
    and save into the Django `Book` model.

    - rating: stores the book price as float (per requirements)
    - author: not provided by this site, stored as "Unknown"
    - duplicates: skipped if a book with same title already exists
    """
    target = max(1, int(target_count))
    max_pages = max(3, (target + 19) // 20)

    created = 0
    skipped = 0
    scraped = 0

    import requests

    session = requests.Session()
    print("[scraper] Scraping started")

    with transaction.atomic():
        for page in range(1, max_pages + 1):
            if scraped >= target:
                break

            page_url = FIRST_PAGE_URL if page == 1 else f"{BASE_URL}page-{page}.html"
            soup = _get_soup(page_url, session)
            books = soup.select("article.product_pod")

            for book in books:
                if scraped >= target:
                    break

                a = book.select_one("h3 a")
                price_node = book.select_one("p.price_color")
                if not a or not price_node:
                    skipped += 1
                    continue

                title = _clean_text(a.get("title") or "")
                relative_url = (a.get("href") or "").strip()
                price = _parse_price_to_float(price_node.get_text(strip=True))

                if not title or not relative_url or price is None:
                    skipped += 1
                    continue

                detail_url = f"{BASE_URL}{relative_url.replace('../', '')}"
                scraped += 1

                if Book.objects.filter(title=title).exists():
                    skipped += 1
                    continue

                try:
                    detail_soup = _get_soup(detail_url, session)
                    description = _extract_description(detail_soup)

                    Book.objects.create(
                        title=title,
                        author="Unknown",
                        description=description,
                        rating=price,
                        book_url=detail_url,
                    )
                    created += 1
                    print(f"Scraped book: {title}")
                except Exception:
                    skipped += 1
                    print(f"[scraper] Failed to save book '{title}' from {detail_url}")
                    traceback.print_exc()

    print(f"Total saved: {created}")
    return {"scraped": scraped, "created": created, "skipped": skipped}

