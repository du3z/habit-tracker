import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { statsApi } from "../api/stats.api.js";
import { habitsApi } from "../api/habits.api.js";

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

function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

const TABS = [
  { value: "log", label: "Отметки" },
  { value: "completed", label: "Завершённые привычки" },
];

export default function History() {
  const [tab, setTab] = useState("log");
  const [history, setHistory] = useState(null);
  const [completedHabits, setCompletedHabits] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tab === "log" && history === null) {
      statsApi
        .history(300, true)
        .then(setHistory)
        .catch((err) => setError(err.response?.data?.message || "Не удалось загрузить историю"));
    }
    if (tab === "completed" && completedHabits === null) {
      loadCompletedHabits();
    }
  }, [tab]);

  async function loadCompletedHabits() {
    try {
      const habits = await habitsApi.list({ view: "completed" });
      const withStats = await Promise.all(
        habits.map(async (h) => {
          const detail = await statsApi.forHabit(h.id);
          return { habit: h, stats: detail.stats };
        })
      );
      setCompletedHabits(withStats);
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось загрузить завершённые привычки");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">История</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Лента ежедневных отметок и список привычек, доведённых до цели.
      </p>

      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              tab === t.value
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}

      {tab === "log" && <LogTab history={history} />}
      {tab === "completed" && <CompletedTab items={completedHabits} />}
    </div>
  );
}

function LogTab({ history }) {
  if (!history) {
    return <div className="text-slate-500 dark:text-slate-400 text-sm">Загрузка...</div>;
  }

  const grouped = groupByDate(history);

  if (grouped.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500">
        Пока нет ни одной отметки выполнения. Отметьте привычку на дашборде — запись появится здесь.
      </p>
    );
  }

  return (
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
  );
}

function CompletedTab({ items }) {
  if (!items) {
    return <div className="text-slate-500 dark:text-slate-400 text-sm">Загрузка...</div>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500">
        Пока нет завершённых привычек. Когда доведёте привычку до цели — нажмите 🏁 «Завершить» на
        карточке, и она появится здесь со своей статистикой.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ habit, stats }) => (
        <Link
          key={habit.id}
          to={`/habits/${habit.id}`}
          className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
            <span className="font-medium text-slate-800 dark:text-slate-100">{habit.title}</span>
            <span className="ml-auto text-xs text-sky-600 dark:text-sky-400">🏁 завершена</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Период: {formatDateShort(habit.start_date)} — {formatDateShort(habit.completed_at)}
            </span>
            <span>🏆 Лучший стрик: {stats.bestStreak}</span>
            <span>{stats.completionRate}% выполнения за всё время</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
