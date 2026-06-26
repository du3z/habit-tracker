import { useEffect, useState } from "react";
import { useHabitStore } from "../store/habit.store.js";
import { habitsApi } from "../api/habits.api.js";
import { statsApi } from "../api/stats.api.js";
import HabitCard from "../components/HabitCard.jsx";
import ArchivedHabitItem from "../components/ArchivedHabitItem.jsx";
import { todayISO } from "../utils/dateHelpers.js";

const TYPES = [
  { value: "", label: "Все типы" },
  { value: "daily", label: "Ежедневная" },
  { value: "weekly", label: "По дням недели" },
  { value: "custom", label: "N раз в неделю" },
];

export default function Dashboard() {
  const {
    habits,
    fetchHabits,
    createHabit,
    removeHabit,
    toggleHabit,
    archiveHabit,
    restoreHabit,
    filters,
    setFilters,
  } = useHabitStore();

  const [statsById, setStatsById] = useState({});
  const [logsById, setLogsById] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedHabits, setArchivedHabits] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", type: "daily", color: "#6366f1" });
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetchHabits();
  }, [filters.search, filters.type]);

  useEffect(() => {
    if (habits.length === 0) {
      setStatsById({});
      return;
    }
    loadStats();
  }, [habits.map((h) => h.id).join(",")]);

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

  async function loadArchived() {
    const list = await habitsApi.list({ archived: "only" });
    setArchivedHabits(list);
  }

  function toggleArchivedPanel() {
    const next = !showArchived;
    setShowArchived(next);
    if (next) loadArchived();
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

  async function handleArchive(id) {
    await archiveHabit(id);
  }

  async function handleRestore(id) {
    await restoreHabit(id);
    setArchivedHabits((prev) => prev.filter((h) => h.id !== id));
    fetchHabits();
  }

  async function handleDeleteArchived(id) {
    await removeHabit(id);
    setArchivedHabits((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Дашборд</h1>
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
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-8 grid gap-3"
        >
          <input
            placeholder="Название (например, Читать 30 минут)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="Описание (опционально)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm flex-1"
            >
              {TYPES.filter((t) => t.value).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent"
            />
          </div>
          <button className="bg-indigo-600 text-white text-sm font-medium rounded-md py-2 hover:bg-indigo-700">
            Создать привычку
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="🔍 Поиск по названию..."
          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value })}
          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={toggleArchivedPanel}
          className="text-sm px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          {showArchived ? "Скрыть архив" : "🗄 Показать архив"}
        </button>
      </div>

      {showArchived && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Архивные привычки
          </h2>
          {archivedHabits.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Архив пуст.</p>
          ) : (
            <div className="grid gap-2">
              {archivedHabits.map((h) => (
                <ArchivedHabitItem
                  key={h.id}
                  habit={h}
                  onRestore={handleRestore}
                  onDelete={handleDeleteArchived}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {habits.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {filters.search || filters.type
            ? "Ничего не найдено по заданным фильтрам."
            : "Пока нет привычек. Создайте первую, чтобы начать отслеживать прогресс."}
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
              onArchive={handleArchive}
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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}
