import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";
import { todayISO } from "../utils/dateHelpers.js";

export default function HabitCard({ habit, stats, doneToday, onToggle, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-2"
            style={{ backgroundColor: habit.color }}
          />
          <Link to={`/habits/${habit.id}`} className="font-semibold text-slate-800 hover:underline">
            {habit.title}
          </Link>
          {habit.description && (
            <p className="text-sm text-slate-500 mt-1">{habit.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-slate-400 hover:text-red-500 text-sm"
          title="Удалить привычку"
        >
          ✕
        </button>
      </div>

      {stats && (
        <>
          <ProgressBar value={stats.completionRate} color={habit.color} />
          <div className="flex justify-between text-xs text-slate-500">
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
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {doneToday ? "✓ Выполнено сегодня" : "Отметить выполнено"}
      </button>
    </div>
  );
}
