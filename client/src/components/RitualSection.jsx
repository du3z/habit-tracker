import { useEffect, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { groupsApi } from "../api/groups.api.js";
import { habitsApi } from "../api/habits.api.js";
import ProgressBar from "./ProgressBar.jsx";

export default function RitualSection() {
  const [groups, setGroups] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [allHabits, setAllHabits] = useState([]);
  const [form, setForm] = useState({ title: "", color: "#8b5cf6", habitIds: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const list = await groupsApi.list();
    setGroups(list);
  }

  async function openForm() {
    const habits = await habitsApi.list({ view: "active" });
    setAllHabits(habits);
    setForm({ title: "", color: "#8b5cf6", habitIds: [] });
    setError("");
    setShowForm(true);
  }

  function toggleHabitInForm(id) {
    setForm((prev) => ({
      ...prev,
      habitIds: prev.habitIds.includes(id)
        ? prev.habitIds.filter((x) => x !== id)
        : [...prev.habitIds, id],
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (form.habitIds.length < 2) {
      setError("Выберите минимум 2 привычки для ритуала");
      return;
    }
    try {
      await groupsApi.create(form);
      setShowForm(false);
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось создать ритуал");
    }
  }

  async function handleDelete(id) {
    await groupsApi.remove(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  if (groups === null) return null;
  if (groups.length === 0 && !showForm) {
    return (
      <div className="mb-8">
        <SectionHeader onCreate={openForm} />
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Объедини несколько привычек в ритуал (например, «Утренний ритуал» из зарядки, чтения и
          медитации) — общий стрик считается только за дни, когда выполнены ВСЕ привычки сразу.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <SectionHeader onCreate={openForm} />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-4 grid gap-3"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <input
            placeholder="Название ритуала (например, Утренний ритуал)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
            required
          />
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Выберите минимум 2 привычки ниже:
            </span>
          </div>

          {allHabits.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Нужно как минимум 2 активные привычки, чтобы собрать ритуал.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {allHabits.map((h) => (
                <label
                  key={h.id}
                  className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900/40 rounded-md px-3 py-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.habitIds.includes(h.id)}
                    onChange={() => toggleHabitInForm(h.id)}
                  />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                  <span className="text-slate-700 dark:text-slate-200">{h.title}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button className="bg-indigo-600 text-white text-sm font-medium rounded-md py-2 px-4 hover:bg-indigo-700">
              Создать ритуал
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-slate-500 dark:text-slate-400 px-4 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <RitualCard key={group.id} group={group} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ onCreate }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-violet-500 dark:text-violet-400" />
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ритуалы</h2>
      </div>
      <button
        onClick={onCreate}
        className="text-xs px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
      >
        + Создать ритуал
      </button>
    </div>
  );
}

function RitualCard({ group, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
          <span className="font-semibold text-slate-800 dark:text-slate-100">{group.title}</span>
        </div>
        <button
          onClick={() => onDelete(group.id)}
          title="Удалить ритуал (привычки внутри сохранятся)"
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {group.members.map((m) => (
          <span
            key={m.id}
            className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            {m.title}
          </span>
        ))}
      </div>

      <ProgressBar value={group.stats.completionRate} color={group.color} />
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
        <span>🔥 Общий стрик: {group.stats.currentStreak}</span>
        <span>🏆 Лучший: {group.stats.bestStreak}</span>
        <span>{group.stats.completionRate}%</span>
      </div>
    </div>
  );
}
