import { useEffect, useState } from "react";
import { useHabitStore } from "../store/habit.store.js";
import { statsApi } from "../api/stats.api.js";
import HabitCard from "../components/HabitCard.jsx";
import { todayISO } from "../utils/dateHelpers.js";

const TYPES = [
  { value: "daily", label: "Ежедневная" },
  { value: "weekly", label: "По дням недели" },
  { value: "custom", label: "N раз в неделю" },
];

export default function Dashboard() {
  const { habits, fetchHabits, createHabit, removeHabit, toggleHabit } = useHabitStore();
  const [statsById, setStatsById] = useState({});
  const [logsById, setLogsById] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "daily", color: "#6366f1" });
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    if (habits.length === 0) return;
    loadStats();
  }, [habits.length]);

  async function loadStats() {
    const data = await statsApi.overview();
    setOverview(data);
    const byId = {};
    data.habits.forEach((h) => (byId[h.id] = h));
    setStatsById(byId);

    const today = todayISO();
    const logsEntries = await Promise.all(
      habits.map(async (h) => {
        const detail = await statsApi.forHabit(h.id);
        const todayLog = detail.logs.find((l) => l.date === today && l.completed);
        return [h.id, { [today]: !!todayLog }];
      })
    );
    setLogsById(Object.fromEntries(logsEntries));
  }

  async function handleCreate(e) {
    e.preventDefault();
    await createHabit(form);
    setForm({ title: "", description: "", type: "daily", color: "#6366f1" });
    setShowForm(false);
    loadStats();
  }

  async function handleToggle(id, date) {
    await toggleHabit(id, date);
    setLogsById((prev) => ({
      ...prev,
      [id]: { ...prev[id], [date]: !prev[id]?.[date] },
    }));
    loadStats();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Дашборд</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? "Отмена" : "+ Новая привычка"}
        </button>
      </div>

      {overview && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Привычек" value={overview.totalHabits} />
          <StatCard label="Средний % выполнения" value={`${overview.avgCompletionRate}%`} />
          <StatCard
            label="Самая успешная"
            value={overview.mostSuccessfulHabit?.title || "—"}
            sub={
              overview.mostSuccessfulHabit
                ? `Лучший стрик: ${overview.mostSuccessfulHabit.bestStreak}`
                : ""
            }
          />
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 mb-8 grid gap-3">
          <input
            placeholder="Название (например, Читать 30 минут)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="Описание (опционально)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm flex-1"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-12 h-10 border border-slate-300 rounded-md"
            />
          </div>
          <button className="bg-indigo-600 text-white text-sm font-medium rounded-md py-2 hover:bg-indigo-700">
            Создать привычку
          </button>
        </form>
      )}

      {habits.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Пока нет привычек. Создайте первую, чтобы начать отслеживать прогресс.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              stats={statsById[habit.id]}
              doneToday={!!logsById[habit.id]?.[todayISO()]}
              onToggle={handleToggle}
              onDelete={removeHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-800 truncate">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
