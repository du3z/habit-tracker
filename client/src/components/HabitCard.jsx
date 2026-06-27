import { Link } from "react-router-dom";
import { Flag, Archive, Trash2 } from "lucide-react";
import ProgressBar from "./ProgressBar.jsx";

const TYPE_LABELS = {
  daily: "Ежедневная",
  weekly: "По дням недели",
  custom: "N раз в неделю",
};

function IconButton({ onClick, title, variant = "default", children }) {
  const variants = {
    default:
      "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
    success:
      "text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30",
    warning:
      "text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30",
    danger:
      "text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default function HabitCard({ habit, stats, doneToday, onToggle, onArchive, onComplete, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3 shadow-sm transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
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
        <div className="flex gap-1 shrink-0">
          <IconButton onClick={() => onComplete(habit.id)} title="Завершить привычку (цель достигнута)" variant="success">
            <Flag size={15} />
          </IconButton>
          <IconButton onClick={() => onArchive(habit.id)} title="Архивировать" variant="warning">
            <Archive size={15} />
          </IconButton>
          <IconButton onClick={() => onDelete(habit.id)} title="Удалить навсегда" variant="danger">
            <Trash2 size={15} />
          </IconButton>
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
        onClick={() => onToggle(habit.id)}
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
