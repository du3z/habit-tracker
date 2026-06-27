import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, CalendarRange } from "lucide-react";
import { statsApi } from "../api/stats.api.js";

function formatRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  return `${new Date(start).toLocaleDateString("ru-RU", opts)} — ${new Date(end).toLocaleDateString("ru-RU", opts)}`;
}

export default function WeeklyReportCard() {
  const [report, setReport] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    statsApi.weeklyReport().then(setReport).catch(() => {});
  }, []);

  if (!report || dismissed || report.lastWeek.possible === 0) return null;

  const { lastWeek, prevWeek, diffRate } = report;
  const trendUp = diffRate > 0;
  const trendDown = diffRate < 0;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-8 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 text-xs"
        title="Скрыть"
      >
        ✕
      </button>

      <div className="flex items-center gap-2 mb-3">
        <CalendarRange size={16} className="text-indigo-500 dark:text-indigo-400" />
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Еженедельный отчёт
        </h2>
        <span className="text-xs text-slate-400 dark:text-slate-500">{formatRange(lastWeek.start, lastWeek.end)}</span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        На прошлой неделе ты выполнил{" "}
        <b className="text-slate-800 dark:text-slate-100">
          {lastWeek.completed} из {lastWeek.possible}
        </b>{" "}
        запланированных отметок ({lastWeek.rate}%).
      </p>

      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full ${
            trendUp
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              : trendDown
              ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}
        >
          {trendUp ? <TrendingUp size={14} /> : trendDown ? <TrendingDown size={14} /> : <Minus size={14} />}
          {trendUp ? `+${diffRate}%` : trendDown ? `${diffRate}%` : "без изменений"}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          по сравнению с неделей до этого ({prevWeek.rate}%, {formatRange(prevWeek.start, prevWeek.end)})
        </span>
      </div>
    </div>
  );
}
