"use client";

import { useMemo, useState } from "react";
import { askQuestion } from "@/lib/api";

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canAsk = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  async function onAsk() {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    try {
      const res = await askQuestion(q);
      if (res.error) setError(res.error);
      setAnswer(res.answer || "");
      setSources(res.sources || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to ask question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Q&A</h1>
        <p className="text-sm text-zinc-600">
          Ask questions grounded in the book database (RAG).
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
        <label className="text-sm font-medium text-zinc-900" htmlFor="q">
          Your question
        </label>
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
            className="h-11 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {loading ? "Asking…" : "Ask"}
          </button>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Tip: run <span className="font-mono">POST /api/books/upload/</span> to scrape + index first.
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Answer</h2>
          {error ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
              {answer || (loading ? "Generating answer…" : "Ask a question to see an answer.")}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Sources</h2>
          {sources?.length ? (
            <ul className="mt-3 space-y-2">
              {sources.map((s, idx) => (
                <li
                  key={`${idx}-${s}`}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700"
                >
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-zinc-700">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">
              Sources will appear here after you ask a question.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

