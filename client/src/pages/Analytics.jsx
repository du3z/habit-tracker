import { useEffect, useState } from "react";
import { useHabitStore } from "../store/habit.store.js";
import { statsApi } from "../api/stats.api.js";
import { ProgressLineChart } from "../components/Chart.jsx";

export default function Analytics() {
  const { habits, fetchHabits } = useHabitStore();
  const [overview, setOverview] = useState(null);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [habitDetail, setHabitDetail] = useState(null);

  useEffect(() => {
    fetchHabits();
    statsApi.overview().then(setOverview);
  }, []);

  useEffect(() => {
    if (habits.length && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits]);

  useEffect(() => {
    if (!selectedHabitId) return;
    statsApi.forHabit(selectedHabitId).then((data) => {
      const chartData = buildLast30DaysSeries(data.logs);
      setHabitDetail({ ...data, chartData });
    });
  }, [selectedHabitId]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Аналитика</h1>

      {overview && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-slate-700 mb-3">Сводка по всем привычкам</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Всего привычек</p>
              <p className="text-lg font-bold">{overview.totalHabits}</p>
            </div>
            <div>
              <p className="text-slate-500">Средний % выполнения</p>
              <p className="text-lg font-bold">{overview.avgCompletionRate}%</p>
            </div>
            <div>
              <p className="text-slate-500">Самая успешная</p>
              <p className="text-lg font-bold">{overview.mostSuccessfulHabit?.title || "—"}</p>
            </div>
          </div>
        </div>
      )}

      {habits.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">Прогресс по привычке</h2>
            <select
              value={selectedHabitId || ""}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>
          {habitDetail && (
            <ProgressLineChart data={habitDetail.chartData} color={habitDetail.habit.color} />
          )}
        </div>
      )}
    </div>
  );
}

function buildLast30DaysSeries(logs) {
  const completedSet = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr.slice(5),
      completed: completedSet.has(dateStr) ? 1 : 0,
    });
  }
  return days;
}
