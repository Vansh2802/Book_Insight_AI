"use client";

import { useMemo, useState } from "react";
import { askQuestion } from "@/lib/api";
import { GenreBadge, inferGenreFromText } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LoadingDots, EmptyState } from "@/components/Loader";

const SAMPLE_QUESTIONS = [
  "Summarize this book",
  "Recommend similar books",
  "What is this book about?",
  "List key takeaways",
  "Who wrote this book?",
];

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<{ title: string; snippet: string; genre?: string }[]>([]);
  const [error, setError] = useState<string>("");
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const canAsk = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  async function onAsk() {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    setFromCache(false);
    setHasAsked(true);
    try {
      const res = await askQuestion(q);
      if (res.error) setError(res.error);
      setAnswer(res.answer || "");
      setSources(res.sources || []);
      setFromCache(Boolean(res.cached));
    } catch (e) {
      const fallback = "Something went wrong while generating the answer. Please try again.";
      setError(e instanceof Error ? e.message : fallback);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && canAsk) onAsk();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      {/* ─── Page Header ─── */}
      <div className="animate-fade-in-up mb-10 flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M5 4a3 3 0 0 1 6 0v1.5a3 3 0 0 1-6 0V4Zm-1.5 6.5A2.5 2.5 0 0 1 6 8h4a2.5 2.5 0 0 1 2.5 2.5v.75A2.75 2.75 0 0 1 9.75 14h-3.5A2.75 2.75 0 0 1 3.5 11.25v-.75Z" clipRule="evenodd" />
          </svg>
          RAG-powered Q&A
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ask <span className="bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">BookMind AI</span>
        </h1>
        <p className="max-w-xl text-sm text-muted sm:text-base">
          Ask anything grounded in your book database. Get AI-synthesized answers with cited sources.
        </p>
      </div>

      {/* ─── Input Card ─── */}
      <Card className="animate-fade-in-up delay-100 bg-surface/80 backdrop-blur-sm">
        <label className="block text-sm font-semibold text-foreground" htmlFor="qa-input">
          Your question
        </label>

        {/* Suggestion Chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setQuestion(sample)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-all duration-200 hover:scale-105 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Input + Button */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            id="qa-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='e.g. "Which books mention mystery and travel?"'
            className="glow-focus h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted/60 outline-none transition-all duration-200 focus:border-accent dark:bg-surface-hover"
          />
          <button
            id="ask-btn"
            onClick={onAsk}
            disabled={!canAsk}
            className="h-12 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-7 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-300 disabled:shadow-none dark:disabled:from-zinc-700 dark:disabled:to-zinc-700"
          >
            {loading ? "Thinking…" : "Ask"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted/70">
          Press <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd> to submit · Sources cite books indexed in your RAG pipeline.
        </p>
      </Card>

      {/* ─── Results ─── */}
      {(hasAsked || loading) && (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Answer Card */}
          <Card gradientBorder className="animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Answer</h2>
              {fromCache && !loading && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  ⚡ Cached
                </span>
              )}
            </div>

            {error ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <p className="font-semibold">Error</p>
                <p className="mt-1">{error}</p>
              </div>
            ) : (
              <div className="relative mt-3 min-h-32 rounded-xl border border-border border-l-4 border-l-emerald-500 bg-surface-hover p-5 dark:border-l-emerald-400">
                {loading ? (
                  <LoadingDots text="Thinking" />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-8 text-foreground">
                    {answer || (
                      <span className="text-muted">Your answer will appear here...</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Sources Card */}
          <Card className="animate-fade-in delay-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Sources</h2>

            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-xl border border-border bg-surface-hover p-4">
                    <div className="h-4 w-2/3 animate-shimmer rounded" />
                    <div className="mt-2 h-3 w-full animate-shimmer rounded" />
                    <div className="mt-1.5 h-3 w-4/5 animate-shimmer rounded" />
                  </div>
                ))}
              </div>
            ) : sources?.length ? (
              <ul className="mt-4 space-y-3">
                {sources.map((s, idx) => (
                  <li
                    key={`${idx}-${s.title}`}
                    className="group rounded-xl border border-border bg-surface-hover p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-surface hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          {idx + 1}
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                          {s.title}
                        </span>
                      </div>
                      <GenreBadge
                        genre={s.genre || inferGenreFromText(`${s.title} ${s.snippet}`)}
                        className="shrink-0"
                      />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{s.snippet}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Sources with matching snippets will appear here.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Initial empty prompt (before any ask) */}
      {!hasAsked && !loading && (
        <div className="mt-10 animate-fade-in">
          <EmptyState
            icon="💬"
            title="Ask your first question"
            description="Type a question above or pick a suggestion chip to get started."
          />
        </div>
      )}
    </div>
  );
}
