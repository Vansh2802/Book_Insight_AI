"use client";

import { useMemo, useState } from "react";
import { askQuestion } from "@/lib/api";

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
  const [sources, setSources] = useState<{ title: string; snippet: string }[]>([]);
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
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Ask The Library AI</h1>
        <p className="text-sm text-zinc-600 sm:text-base">
          Ask questions grounded in the book database (RAG).
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <label className="text-sm font-medium text-zinc-900" htmlFor="q">
          Your question
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setQuestion(sample)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100"
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
            className="h-11 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none ring-zinc-900/10 focus:ring-4"
          />
          <button
            onClick={onAsk}
            disabled={!canAsk}
            className="h-11 rounded-lg bg-emerald-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Tip: run <span className="font-mono">POST /api/books/upload/</span> to scrape + index first.
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
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
            <div className="mt-3 min-h-28 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <LoadingDots />
                  <span>Thinking...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                  {answer || "Ask a question to see an answer."}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Sources</h2>
          {sources?.length ? (
            <ul className="mt-3 space-y-3">
              {sources.map((s, idx) => (
                <li
                  key={`${idx}-${s.title}-${s.snippet}`}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-zinc-700">
                    {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">{s.title}</span>
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
        </div>
      </div>
    </div>
  );
}

