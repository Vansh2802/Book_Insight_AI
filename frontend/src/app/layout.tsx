import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book AI Platform",
  description: "Browse books, get AI insights, and ask questions with RAG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight">
              Book AI
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="rounded-md px-2 py-1 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Books
              </Link>
              <Link
                href="/qa"
                className="rounded-md px-2 py-1 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Q&A
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-zinc-500">
            Backend base URL via{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5">
              NEXT_PUBLIC_API_BASE_URL
            </code>
          </div>
        </footer>
      </body>
    </html>
  );
}
