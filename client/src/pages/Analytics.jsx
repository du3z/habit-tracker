import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useHabitStore } from "../store/habit.store.js";
import { statsApi } from "../api/stats.api.js";
import {
  ProgressLineChart,
  WeeklyBarChart,
  WeekdayBarChart,
  MonthlyBarChart,
} from "../components/Chart.jsx";

function formatMonth(monthStr) {
  const [year, month] = monthStr.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
}

export default function Analytics() {
  const { habits, fetchHabits } = useHabitStore();
  const [overview, setOverview] = useState(null);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [habitDetail, setHabitDetail] = useState(null);

  useEffect(() => {
    fetchHabits({ view: "active" });
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

  const bestWeekday = habitDetail?.byWeekday?.length
    ? [...habitDetail.byWeekday].sort((a, b) => b.count - a.count)[0]
    : null;

  const monthlyTrend = habitDetail?.monthly?.length >= 2
    ? habitDetail.monthly[habitDetail.monthly.length - 1].count -
      habitDetail.monthly[habitDetail.monthly.length - 2].count
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Аналитика</h1>

      {}
      {overview && (
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Сводка по всем привычкам
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm mb-5">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Всего привычек</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {overview.totalHabits}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Средний % выполнения</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {overview.avgCompletionRate}%
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Самая успешная</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {overview.mostSuccessfulHabit?.title || "—"}
              </p>
            </div>
          </div>

          {}
          {overview.ranking?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                Рейтинг по % выполнения
              </h3>
              <div className="space-y-2">
                {overview.ranking.map((h, idx) => (
                  <Link
                    key={h.id}
                    to={`/habits/${h.id}`}
                    className="flex items-center gap-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                  >
                    <span className="w-5 text-slate-400 dark:text-slate-500 text-xs">#{idx + 1}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                    <span className="text-slate-700 dark:text-slate-200 flex-1">{h.title}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      🔥 {h.currentStreak} · 🏆 {h.bestStreak}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 w-12 text-right">
                      {h.completionRate}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {}
      {habits.length > 0 && (
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">
              Подробный анализ привычки
            </h2>
            <select
              value={selectedHabitId || ""}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-1.5 text-sm"
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>

          {habitDetail && (
            <div className="space-y-6">
              {}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <Insight
                  label="Лучший день недели"
                  value={bestWeekday ? `${bestWeekday.day} (${bestWeekday.count})` : "—"}
                />
                <Insight
                  label="Тренд месяц к месяцу"
                  value={
                    monthlyTrend === null
                      ? "Недостаточно данных"
                      : monthlyTrend > 0
                      ? `+${monthlyTrend} дней`
                      : monthlyTrend === 0
                      ? "Без изменений"
                      : `${monthlyTrend} дней`
                  }
                  positive={monthlyTrend > 0}
                  negative={monthlyTrend < 0}
                />
                <Insight
                  label="Текущий стрик / лучший"
                  value={`${habitDetail.stats.currentStreak} / ${habitDetail.stats.bestStreak}`}
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                  Прогресс за последние 30 дней
                </h3>
                <ProgressLineChart data={habitDetail.chartData} color={habitDetail.habit.color} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                    Выполнение по неделям
                  </h3>
                  <WeeklyBarChart data={habitDetail.weekly} color={habitDetail.habit.color} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                    Выполнение по дням недели
                  </h3>
                  <WeekdayBarChart data={habitDetail.byWeekday} color={habitDetail.habit.color} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                  Сравнение месяцев
                </h3>
                {habitDetail.monthly?.length > 0 ? (
                  <>
                    <MonthlyBarChart data={habitDetail.monthly} color={habitDetail.habit.color} />
                    <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {habitDetail.monthly.map((m) => (
                        <span key={m.month}>
                          {formatMonth(m.month)}: <b className="text-slate-700 dark:text-slate-200">{m.count}</b>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Пока недостаточно данных для сравнения месяцев.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Insight({ label, value, positive, negative }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-md p-3">
      <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
      <p
        className={`font-semibold ${
          positive
            ? "text-emerald-600 dark:text-emerald-400"
            : negative
            ? "text-red-500 dark:text-red-400"
            : "text-slate-800 dark:text-slate-100"
        }`}
      >
        {value}
      </p>
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
