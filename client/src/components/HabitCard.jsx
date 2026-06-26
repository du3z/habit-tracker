import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";
import { todayISO } from "../utils/dateHelpers.js";

const TYPE_LABELS = {
  daily: "Ежедневная",
  weekly: "По дням недели",
  custom: "N раз в неделю",
};

export default function HabitCard({ habit, stats, doneToday, onToggle, onArchive, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3 shadow-sm transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-2"
            style={{ backgroundColor: habit.color }}
          />
          <Link
            to={`/habits/${habit.id}`}
            className="font-semibold text-slate-800 dark:text-slate-100 hover:underline"
          >
            {habit.title}
          </Link>
          <span className="ml-2 text-[11px] text-slate-400 dark:text-slate-500 align-middle">
            {TYPE_LABELS[habit.type]}
          </span>
          {habit.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{habit.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onArchive(habit.id)}
            className="text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 text-sm"
            title="Архивировать привычку"
          >
            🗄
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-sm"
            title="Удалить привычку навсегда"
          >
            ✕
          </button>
        </div>
      </div>

      {stats && (
        <>
          <ProgressBar value={stats.completionRate} color={habit.color} />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>🔥 Стрик: {stats.currentStreak}</span>
            <span>🏆 Лучший: {stats.bestStreak}</span>
            <span>{stats.completionRate}% выполнено</span>
          </div>
        </>
      )}

      <button
        onClick={() => onToggle(habit.id, todayISO())}
        className={`mt-1 text-sm font-medium rounded-md py-2 transition-colors ${
          doneToday
            ? "bg-white dark:bg-slate-800 border border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {doneToday ? "✓ Выполнено · удалить отметку" : "Отметить выполнено"}
      </button>
    </div>
  );
}
