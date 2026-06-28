import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flag, Archive, Share2 } from "lucide-react";
import { statsApi } from "../api/stats.api.js";
import { habitsApi } from "../api/habits.api.js";
import Calendar from "../components/Calendar.jsx";
import { WeeklyBarChart } from "../components/Chart.jsx";
import ShareModal from "../components/ShareModal.jsx";

export default function HabitPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);

  async function load() {
    try {
      const result = await statsApi.forHabit(id);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Привычка не найдена");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleArchive() {
    await habitsApi.archive(id);
    navigate("/");
  }

  async function handleComplete() {
    await habitsApi.complete(id);
    navigate("/");
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button onClick={() => navigate("/")} className="text-indigo-600 dark:text-indigo-400 text-sm mt-2">
          ← Назад на дашборд
        </button>
      </div>
    );
  }

  if (!data) return <div className="px-6 py-8 text-slate-500 dark:text-slate-400">Загрузка...</div>;

  const { habit, stats, logs, weekly } = data;
  // завершённые и архивные привычки — режим "только просмотр", без действий
  const isReadOnly = habit.completed || habit.archived;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/")} className="text-indigo-600 dark:text-indigo-400 text-sm mb-4">
        ← Назад на дашборд
      </button>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{habit.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShare(true)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Поделиться прогрессом"
          >
            <Share2 size={17} />
          </button>

          {isReadOnly ? (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                habit.completed
                  ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400"
                  : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
              }`}
            >
              {habit.completed ? "🏁 Завершена" : "🗄 В архиве"}
            </span>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleComplete}
                className="w-9 h-9 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                title="Завершить привычку (цель достигнута)"
              >
                <Flag size={17} />
              </button>
              <button
                onClick={handleArchive}
                className="w-9 h-9 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                title="Архивировать привычку"
              >
                <Archive size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
      {habit.description && <p className="text-slate-500 dark:text-slate-400 mb-6">{habit.description}</p>}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatBox label="Текущий стрик" value={stats.currentStreak} />
        <StatBox label="Лучший стрик" value={stats.bestStreak} />
        <StatBox label="% выполнения" value={`${stats.completionRate}%`} />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-6">
        <Calendar logs={logs} color={habit.color} />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Выполнение по неделям</h4>
        <WeeklyBarChart data={weekly} color={habit.color} />
      </div>

      {showShare && <ShareModal habit={habit} stats={stats} onClose={() => setShowShare(false)} />}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
