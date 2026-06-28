import { toISODate } from "./dateHelpers.js";

export function calculateStreaks(completedDates, startDate) {
  const dateSet = new Set(completedDates);
  const sorted = [...completedDates].sort();

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

  let currentStreak = 0;
  let cursor = new Date();

  if (!dateSet.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dateSet.has(toISODate(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

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
