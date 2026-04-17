import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ToggleTheme } from "@/components/ToggleTheme";
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
  title: "BookMind AI — Ask anything. Discover every book.",
  description:
    "BookMind AI is an AI-powered book discovery platform. Search, summarize, and get intelligent answers grounded in your book collection.",
  keywords: ["AI", "books", "RAG", "search", "summarize", "discover"],
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
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to prevent dark-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('bookmind-theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* ─── Sticky Header ─── */}
        <header className="glass sticky top-0 z-50 border-b border-border/60">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
            {/* Logo + Title */}
            <Link
              href="/"
              className="group flex items-center gap-3 transition-all duration-200 hover:opacity-90"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-lg text-white shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg">
                📚
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                  BookMind AI
                </span>
                <span className="hidden text-[11px] text-muted sm:inline">
                  Ask anything. Discover every book.
                </span>
              </span>
            </Link>

            {/* Nav + Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 font-medium text-muted transition-all duration-200 hover:bg-surface-hover hover:text-foreground"
                >
                  Books
                </Link>
                <Link
                  href="/qa"
                  className="rounded-lg px-3 py-2 font-medium text-muted transition-all duration-200 hover:bg-surface-hover hover:text-foreground"
                >
                  Q&A
                </Link>
              </nav>

              <div className="mx-1 h-5 w-px bg-border sm:mx-2" />

              <ToggleTheme />
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="flex-1">{children}</main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border bg-surface/50">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-[10px] text-white">
                📚
              </span>
              <span>BookMind AI · Built with AI-powered RAG</span>
            </div>
            <div className="text-xs text-muted/60">
              Powered by Django + Next.js + ChromaDB
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
