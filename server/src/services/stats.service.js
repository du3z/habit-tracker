import { habitRepository } from "../repositories/habit.repository.js";
import { habitLogRepository } from "../repositories/habitLog.repository.js";
import { calculateStreaks } from "../utils/calculateStreak.js";

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

    // рейтинг привычек по % выполнения, для таблицы в аналитике
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

    return {
      habit,
      stats,
      logs: logs.map((l) => ({ date: l.date.toISOString().slice(0, 10), completed: l.completed })),
      weekly,
      byWeekday,
      monthly,
    };
  },

  async history(userId, limit = 200) {
    const rows = await habitLogRepository.findCompletedHistory(userId, limit);
    return rows.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      habitId: r.habit_id,
      title: r.title,
      color: r.color,
    }));
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
  // начинаем неделю с понедельника для привычного отображения
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
