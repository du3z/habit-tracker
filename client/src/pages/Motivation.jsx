import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Shuffle } from "lucide-react";
import { QUOTES } from "../data/quotes.js";

export default function Motivation() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  function go(delta) {
    setDirection(delta);
    setIndex((prev) => (prev + delta + QUOTES.length) % QUOTES.length);
  }

  function shuffle() {
    setDirection(1);
    setIndex((prev) => {
      let next = Math.floor(Math.random() * QUOTES.length);
      if (next === prev) next = (next + 1) % QUOTES.length;
      return next;
    });
  }

  const quote = QUOTES[index];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Мотивация</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Немного поддержки, чтобы не бросить начатое. Листай — тут немного.
      </p>

      <div
        key={index}
        className={`relative bg-gradient-to-br ${quote.gradient} rounded-2xl p-10 sm:p-12 min-h-[280px] flex flex-col justify-center shadow-lg transition-all`}
      >
        <Quote className="text-white/25 mb-4" size={40} strokeWidth={2.5} />
        <p className="text-white text-xl sm:text-2xl font-medium leading-snug">{quote.text}</p>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => go(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Предыдущая"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {index + 1} / {QUOTES.length}
          </span>
          <button
            onClick={shuffle}
            className="ml-2 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Случайная цитата"
          >
            <Shuffle size={13} />
            Случайная
          </button>
        </div>

        <button
          onClick={() => go(1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Следующая"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
