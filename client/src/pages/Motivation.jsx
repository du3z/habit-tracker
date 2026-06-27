import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Shuffle, Flame, CheckCircle2, Lightbulb } from "lucide-react";
import { QUOTES } from "../data/quotes.js";

const TIPS = [
  {
    icon: Lightbulb,
    title: "Начинай с малого",
    text: "2 минуты лучше, чем 0. Маленький шаг сегодня — это всё ещё шаг.",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Flame,
    title: "Не рви стрик",
    text: "Пропустил день — не страшно. Пропустил два подряд — уже звонок себе.",
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    icon: CheckCircle2,
    title: "Отмечай сразу",
    text: "Сделал — сразу нажми галочку. Мозг любит мгновенное подтверждение.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

export default function Motivation() {
  const [index, setIndex] = useState(0);

  function go(delta) {
    setIndex((prev) => (prev + delta + QUOTES.length) % QUOTES.length);
  }

  function shuffle() {
    setIndex((prev) => {
      let next = Math.floor(Math.random() * QUOTES.length);
      if (next === prev) next = (next + 1) % QUOTES.length;
      return next;
    });
  }

  const quote = QUOTES[index];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Мотивация</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Немного поддержки, чтобы не бросить начатое. Листай — тут немного.
      </p>

      {/* контейнер-"сцена" с декоративными пятнами под карточкой, чтобы цитата
          не торчала "голым" ярким прямоугольником посреди светлого фона */}
      <div className="relative rounded-3xl bg-slate-100 dark:bg-slate-800/50 p-6 sm:p-10 mb-6 overflow-hidden">
        <div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
        />
        <div
          className="absolute -bottom-12 -right-12 w-52 h-52 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #f472b6, transparent)" }}
        />

        <div
          key={index}
          className={`relative bg-gradient-to-br ${quote.gradient} rounded-2xl p-8 sm:p-10 min-h-[240px] flex flex-col justify-center shadow-xl ring-1 ring-black/5`}
        >
          <Quote className="text-white/30 mb-4" size={36} strokeWidth={2.5} />
          <p className="text-white text-lg sm:text-xl font-medium leading-snug">{quote.text}</p>
        </div>

        <div className="relative flex items-center justify-between mt-6">
          <button
            onClick={() => go(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-colors"
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
              className="ml-2 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-colors"
              title="Случайная цитата"
            >
              <Shuffle size={13} />
              Случайная
            </button>
          </div>

          <button
            onClick={() => go(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-colors"
            title="Следующая"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
        Памятка на каждый день
      </h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {TIPS.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.title}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
            >
              <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${tip.bg} mb-3`}>
                <Icon className={tip.color} size={18} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                {tip.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
