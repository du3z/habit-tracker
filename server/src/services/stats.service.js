import { habitRepository } from "../repositories/habit.repository.js";
import { habitLogRepository } from "../repositories/habitLog.repository.js";
import { calculateStreaks } from "../utils/calculateStreak.js";
import { query } from "../config/db.js";

const WEEKDAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

async function habitWithStats(habit) {
  const logs = await habitLogRepository.findByHabit(habit.id);
  const completedDates = logs
    .filter((l) => l.completed)
    .map((l) => l.date.toISOString().slice(0, 10));
  const stats = calculateStreaks(completedDates, habit.start_date);
  return {
    habit,
    logs,
    stats,
  };
}

export const statsService = {
  async overview(userId) {
    const habits = await habitRepository.findAllByUser(userId);
    const withStats = await Promise.all(habits.map(habitWithStats));

    const totalHabits = withStats.length;
    const avgCompletionRate = totalHabits
      ? Math.round(
          withStats.reduce((sum, h) => sum + h.stats.completionRate, 0) / totalHabits
        )
      : 0;

    const best = withStats.reduce(
      (acc, h) => (h.stats.bestStreak > (acc?.stats.bestStreak ?? -1) ? h : acc),
      null
    );

    const habitSummaries = withStats.map(({ habit, stats }) => ({
      id: habit.id,
      title: habit.title,
      color: habit.color,
      type: habit.type,
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      completionRate: stats.completionRate,
    }));

    const ranking = [...habitSummaries].sort((a, b) => b.completionRate - a.completionRate);

    return {
      totalHabits,
      avgCompletionRate,
      mostSuccessfulHabit: best
        ? { id: best.habit.id, title: best.habit.title, bestStreak: best.stats.bestStreak }
        : null,
      habits: habitSummaries,
      ranking,
    };
  },

  async forHabit(userId, habitId) {
    const habit = await habitRepository.findById(habitId);
    if (!habit || habit.user_id !== userId) {
      const err = new Error("Привычка не найдена");
      err.status = 404;
      throw err;
    }
    const { logs, stats } = await habitWithStats(habit);

    const weekly = aggregateByWeek(logs);
    const byWeekday = aggregateByWeekday(logs);
    const monthly = aggregateByMonth(logs);

    const todayStr = new Date().toISOString().slice(0, 10);
    const completedToday = logs.some((l) => l.date.toISOString().slice(0, 10) === todayStr && l.completed);

    return {
      habit,
      stats,
      logs: logs.map((l) => ({ date: l.date.toISOString().slice(0, 10), completed: l.completed })),
      weekly,
      byWeekday,
      monthly,
      completedToday,
    };
  },

  async history(userId, limit = 200, options = {}) {
    const rows = await habitLogRepository.findCompletedHistory(userId, limit, options);
    return rows.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      habitId: r.habit_id,
      title: r.title,
      color: r.color,
    }));
  },

  async weeklyReport(userId) {
    const habits = await habitRepository.findAllByUser(userId, { view: "active" });

    const today = new Date();
    const thisMonday = mondayOf(today);
    const lastWeekStart = addDays(thisMonday, -7);
    const lastWeekEnd = addDays(thisMonday, -1);
    const prevWeekStart = addDays(thisMonday, -14);
    const prevWeekEnd = addDays(thisMonday, -8);

    const lastWeek = await computeWeekStats(habits, lastWeekStart, lastWeekEnd);
    const prevWeek = await computeWeekStats(habits, prevWeekStart, prevWeekEnd);

    return {
      lastWeek: { ...lastWeek, start: isoDate(lastWeekStart), end: isoDate(lastWeekEnd) },
      prevWeek: { ...prevWeek, start: isoDate(prevWeekStart), end: isoDate(prevWeekEnd) },
      diffCompleted: lastWeek.completed - prevWeek.completed,
      diffRate: lastWeek.rate - prevWeek.rate,
    };
  },
};

function aggregateByWeek(logs) {
  const completedDates = logs.filter((l) => l.completed).map((l) => l.date);
  const buckets = {};
  for (const date of completedDates) {
    const d = new Date(date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-8)
    .map(([week, count]) => ({ week, count }));
}

function aggregateByWeekday(logs) {
  const counts = new Array(7).fill(0);
  for (const log of logs) {
    if (!log.completed) continue;
    const day = new Date(log.date).getDay();
    counts[day] += 1;
  }

  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((day) => ({ day: WEEKDAY_LABELS[day], count: counts[day] }));
}

function aggregateByMonth(logs) {
  const buckets = {};
  for (const log of logs) {
    if (!log.completed) continue;
    const d = new Date(log.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-6)
    .map(([month, count]) => ({ month, count }));
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

async function computeWeekStats(habits, rangeStart, rangeEnd) {
  if (habits.length === 0) return { completed: 0, possible: 0, rate: 0 };

  const rangeStartStr = isoDate(rangeStart);
  const rangeEndStr = isoDate(rangeEnd);

  let possible = 0;
  for (const habit of habits) {
    const habitStart = new Date(habit.start_date) > rangeStart ? new Date(habit.start_date) : rangeStart;
    if (habitStart > rangeEnd) continue;
    const days = Math.round((rangeEnd - habitStart) / (1000 * 60 * 60 * 24)) + 1;
    possible += Math.max(0, days);
  }

  const ids = habits.map((h) => h.id);
  const { rows } = await query(
    `SELECT count(*)::int AS count FROM habit_logs
     WHERE habit_id = ANY($1) AND completed = true AND date BETWEEN $2 AND $3`,
    [ids, rangeStartStr, rangeEndStr]
  );
  const completed = rows[0]?.count || 0;
  const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

  return { completed, possible, rate };
}
