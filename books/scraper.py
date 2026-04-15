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

from dataclasses import dataclass
from typing import List, Optional
from urllib.parse import urljoin

from django.db import transaction

from .models import Book


BASE_URL = "http://books.toscrape.com/"
CATEGORY_URL = urljoin(BASE_URL, "catalogue/category/books_1/index.html")


@dataclass
class ScrapedBook:
    title: str
    price_as_float: Optional[float]
    detail_url: str
    description: str


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
    t = _clean_text(price_text).replace("£", "")
    try:
        return float(t)
    except ValueError:
        return None


def _extract_description(detail_soup) -> str:
    # On books.toscrape.com the description sits in the <p> after #product_description.
    header = detail_soup.select_one("#product_description")
    if not header:
        return ""
    p = header.find_next_sibling("p")
    if not p:
        return ""
    return _clean_text(p.get_text(" ", strip=True))


def _scrape_listing_page(listing_url: str, session) -> tuple[List[tuple[str, str, Optional[float]]], Optional[str]]:
    soup = _get_soup(listing_url, session)

    items: List[tuple[str, str, Optional[float]]] = []
    for pod in soup.select("article.product_pod"):
        a = pod.select_one("h3 a")
        if not a:
            continue
        title = _clean_text(a.get("title") or a.get_text(" ", strip=True))
        rel = a.get("href") or ""
        detail_url = urljoin(listing_url, rel)
        price_el = pod.select_one(".price_color")
        price = _parse_price_to_float(price_el.get_text(strip=True) if price_el else "")
        items.append((title, detail_url, price))

    next_a = soup.select_one("li.next a")
    next_url = urljoin(listing_url, next_a.get("href")) if next_a and next_a.get("href") else None
    return items, next_url


def run_scraper(target_count: int = 30) -> dict:
    """
    Scrape ~target_count books, visit each detail page for description,
    and save into the Django `Book` model.

    - rating: stores the book price as float (per requirements)
    - author: not provided by this site, stored as "Unknown"
    - duplicates: skipped if a book with same title already exists
    """
    target = max(1, int(target_count))

    created = 0
    skipped = 0
    scraped = 0

    import requests

    session = requests.Session()
    listing_url: Optional[str] = CATEGORY_URL

    with transaction.atomic():
        while listing_url and scraped < target:
            rows, listing_url = _scrape_listing_page(listing_url, session)
            for title, detail_url, price in rows:
                if scraped >= target:
                    break
                scraped += 1

                if Book.objects.filter(title=title).exists():
                    skipped += 1
                    continue

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

    return {"scraped": scraped, "created": created, "skipped": skipped}

