import { toISODate } from "./dateHelpers.js";

/**
 * Принимает массив выполненных дат (YYYY-MM-DD, completed=true) и считает:
 * - currentStreak: текущая серия подряд идущих дней до сегодня
 * - bestStreak: лучшая серия за всё время
 * - completionRate: % выполнения от первого дня привычки до сегодня
 */
export function calculateStreaks(completedDates, startDate) {
  const dateSet = new Set(completedDates);
  const sorted = [...completedDates].sort();

  // best streak: проходим по отсортированным датам, считаем максимум подряд идущих
  let bestStreak = 0;
  let running = 0;
  let prevDate = null;
  for (const dateStr of sorted) {
    if (prevDate) {
      const diffDays = Math.round(
        (new Date(dateStr) - new Date(prevDate)) / (1000 * 60 * 60 * 24)
      );
      running = diffDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }
    bestStreak = Math.max(bestStreak, running);
    prevDate = dateStr;
  }

  // current streak: идём от сегодня назад, пока день есть в dateSet
  let currentStreak = 0;
  let cursor = new Date();
  // если сегодня ещё не отмечено, начинаем считать со вчера (чтобы не сбрасывать стрик сразу)
  if (!dateSet.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dateSet.has(toISODate(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // % выполнения с момента start_date до сегодня (включительно)
  const start = new Date(startDate);
  const today = new Date();
  const totalDays =
    Math.max(
      1,
      Math.round((today - start) / (1000 * 60 * 60 * 24)) + 1
    );
  const completionRate = Math.round((completedDates.length / totalDays) * 100);

  return { currentStreak, bestStreak, completionRate, totalDays };
}
