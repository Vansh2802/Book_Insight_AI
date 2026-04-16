import { API_BASE_URL } from "./config";

export type Book = {
  id: number;
  title: string;
  author: string;
  description: string;
  rating: number | null;
  book_url: string;
  created_at: string;
  summary?: string;
  recommended_books?: { id: number; title: string; snippet?: string }[];
};

export type AskResponse = {
  answer: string;
  sources: { title: string; snippet: string }[];
  error?: string;
  cached?: boolean;
  cached_at?: string;
};

async function apiFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = text && isJson ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.error || data.detail)) ||
      (isJson ? `Request failed (${res.status})` : `Request failed (${res.status}) from ${url}`);
    throw new Error(message);
  }

  if (!isJson) {
    throw new Error(`Expected JSON but received non-JSON response from ${url}`);
  }

  return data;
}

export async function getBooks(): Promise<Book[]> {
  return apiFetch("/api/books/");
}

export async function getBook(id: string | number): Promise<Book> {
  return apiFetch(`/api/books/${id}/`);
}

export async function askQuestion(question: string): Promise<AskResponse> {
  return apiFetch("/api/books/ask/", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

