import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { statsApi } from "../api/stats.api.js";

function groupByDate(history) {
  const groups = {};
  for (const entry of history) {
    groups[entry.date] = groups[entry.date] || [];
    groups[entry.date].push(entry);
  }
  return Object.entries(groups).sort(([a], [b]) => (a > b ? -1 : 1));
}

function formatDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function History() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    statsApi
      .history(300)
      .then(setHistory)
      .catch((err) => setError(err.response?.data?.message || "Не удалось загрузить историю"));
  }, []);

  if (error) {
    return <div className="max-w-3xl mx-auto px-6 py-8 text-red-500 dark:text-red-400">{error}</div>;
  }

  if (!history) {
    return <div className="px-6 py-8 text-slate-500 dark:text-slate-400">Загрузка...</div>;
  }

  const grouped = groupByDate(history);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
        История выполнения
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Все отметки выполнения по всем привычкам, от самой свежей.
      </p>

      {grouped.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Пока нет ни одной отметки выполнения. Отметьте привычку на дашборде — запись появится здесь.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                {formatDateLong(date)}
              </h3>
              <div className="space-y-2">
                {entries.map((entry, idx) => (
                  <Link
                    key={`${entry.habitId}-${idx}`}
                    to={`/habits/${entry.habitId}`}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{entry.title}</span>
                    <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">
                      ✓ выполнено
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
