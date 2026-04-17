"use client";

import { useMemo, useState } from "react";
import { askQuestion } from "@/lib/api";
import { GenreBadge, inferGenreFromText } from "@/components/Badge";
import { Card } from "@/components/Card";

const SAMPLE_QUESTIONS = [
  "Summarize this book",
  "Recommend similar books",
  "What is this book about?",
];

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Thinking">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
    </span>
  );
}

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<{ title: string; snippet: string; genre?: string }[]>([]);
  const [error, setError] = useState<string>("");
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(false);

  const canAsk = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  async function onAsk() {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    setFromCache(false);
    try {
      const res = await askQuestion(q);
      if (res.error) {
        setError(res.error);
      }
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Ask BookMind AI</h1>
        <p className="text-sm text-zinc-600 sm:text-base">
          Ask questions grounded in the book database (RAG).
        </p>
      </div>

      <Card className="mt-8 bg-white/95 backdrop-blur">
        <label className="text-sm font-medium text-zinc-900" htmlFor="q">
          Your question
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setQuestion(sample)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-all duration-200 hover:scale-105 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            >
              {sample}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='e.g. "Which books mention mystery and travel?"'
            className="h-12 flex-1 rounded-xl border border-zinc-200 px-4 text-sm outline-none transition-all duration-200 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200/70"
          />
          <button
            onClick={onAsk}
            disabled={!canAsk}
            className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:from-emerald-600 hover:to-teal-600 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-300"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Tip: run <span className="font-mono">POST /api/books/upload/</span> to scrape + index first.
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card gradientBorder>
          <h2 className="text-sm font-semibold text-zinc-900">Answer</h2>
          {fromCache && !loading ? (
            <div className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Served from cache
            </div>
          ) : null}
          {error ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <div className="mt-3 min-h-28 rounded-xl border border-zinc-200 border-l-4 border-l-emerald-500 bg-zinc-50 p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <LoadingDots />
                  <span>Thinking...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-8 text-zinc-700">
                  {answer || "Ask a question to see an answer."}
                </p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-900">Sources</h2>
          {sources?.length ? (
            <ul className="mt-3 space-y-3">
              {sources.map((s, idx) => (
                <li
                  key={`${idx}-${s.title}-${s.snippet}`}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-zinc-700">
                    {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">{s.title}</span>
                    </div>
                    <GenreBadge genre={s.genre || inferGenreFromText(`${s.title} ${s.snippet}`)} />
                  </div>
                  <p className="text-xs leading-5 text-zinc-600">{s.snippet}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">
              Sources with matching snippets will appear here after you ask.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

