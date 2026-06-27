import bcrypt from "bcryptjs";
import { pool, query } from "../config/db.js";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  console.log("🌱 Seeding test data...");

  await query(`DELETE FROM users WHERE email = $1`, [TEST_EMAIL]);

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const { rows: userRows } = await query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
    [TEST_EMAIL, passwordHash]
  );
  const userId = userRows[0].id;

  const today = new Date();
  const DAYS_HISTORY = 90; // ~3 месяца, чтобы было что сравнивать в аналитике
  const start = new Date(today);
  start.setDate(start.getDate() - DAYS_HISTORY);

  // startedDaysAgo / endedDaysAgo — задают "активный" период привычки относительно сегодня.
  // Если не заданы — привычка активна весь период истории (90 дней) и до сих пор.
  const habitsToCreate = [
    {
      title: "Читать 30 минут",
      description: "Чтение книги перед сном",
      type: "daily",
      color: "#6366f1",
      target_days: 90,
      archived: false,
      completed: false,
      // высокая и стабильная успешность, чуть растёт со временем (привычка закрепляется)
      probability: (daysAgo) => 0.55 + (DAYS_HISTORY - daysAgo) / DAYS_HISTORY * 0.35,
      forcedRecentStreakDays: 6,
      todayCompleted: true, // уже отмечена сегодня — кнопка сразу "удалить отметку"
    },
    {
      title: "Тренировка",
      description: "Зал или домашняя тренировка",
      type: "custom",
      color: "#22c55e",
      target_days: 90,
      archived: false,
      completed: false,
      // явно выше по будням, ниже в выходные — чтобы был виден паттерн по дням недели
      probability: (daysAgo, date) => {
        const weekday = date.getDay(); // 0 = вс, 6 = сб
        const isWeekend = weekday === 0 || weekday === 6;
        return isWeekend ? 0.2 : 0.65;
      },
      todayCompleted: false, // нужно нажать самому
    },
    {
      title: "Учить английский",
      description: "Анки + 15 минут практики",
      type: "daily",
      color: "#f59e0b",
      target_days: 90,
      archived: false,
      completed: false,
      // низкая успешность, с явным провалом в середине периода (бросил и вернулся)
      probability: (daysAgo) => (daysAgo > 30 && daysAgo < 55 ? 0.05 : 0.4),
      forcedRecentStreakDays: 3,
      todayCompleted: true,
    },
    {
      title: "Медитация",
      description: "10 минут осознанности по утрам",
      type: "weekly",
      color: "#ec4899",
      target_days: 60,
      archived: false,
      completed: false,
      probability: () => 0.5,
      todayCompleted: false,
    },
    {
      title: "Бросить сладкое",
      description: "Старая привычка, уже не отслеживается",
      type: "daily",
      color: "#94a3b8",
      target_days: 30,
      archived: true, // демонстрация архивной привычки
      completed: false,
      probability: () => 0.3,
      endedDaysAgo: 60, // активна была только в первой части периода
    },
    {
      title: "Отжимания 100 раз в день",
      description: "Челлендж на 30 дней — цель достигнута!",
      type: "daily",
      color: "#0ea5e9",
      target_days: 30,
      archived: false,
      completed: true, // демонстрация завершённой привычки (цель достигнута)
      probability: () => 0.9,
      startedDaysAgo: 50, // челлендж шёл с 50-го по 20-й день назад
      endedDaysAgo: 20,
    },
  ];

  for (const h of habitsToCreate) {
    const completedAt = h.completed
      ? isoDate(new Date(today.getTime() - (h.endedDaysAgo || 0) * 86400000))
      : null;

    const { rows } = await query(
      `INSERT INTO habits (user_id, title, description, type, color, target_days, start_date, archived, completed, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        userId,
        h.title,
        h.description,
        h.type,
        h.color,
        h.target_days,
        isoDate(start),
        h.archived,
        !!h.completed,
        completedAt,
      ]
    );
    const habitId = rows[0].id;

    for (let i = 0; i <= DAYS_HISTORY; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      if (date > today) break;

      const daysAgo = Math.round((today - date) / (1000 * 60 * 60 * 24));

      if (h.startedDaysAgo !== undefined && daysAgo > h.startedDaysAgo) continue;
      if (h.endedDaysAgo !== undefined && daysAgo < h.endedDaysAgo) continue;

      const forced = h.forcedRecentStreakDays && daysAgo <= h.forcedRecentStreakDays;
      let completedLog = forced ? true : Math.random() < h.probability(daysAgo, date);
      if (daysAgo === 0 && typeof h.todayCompleted === "boolean") {
        completedLog = h.todayCompleted; // явная фиксация состояния "сегодня" для демо
      }

      if (completedLog) {
        await query(
          `INSERT INTO habit_logs (habit_id, date, completed) VALUES ($1, $2, true)
           ON CONFLICT (habit_id, date) DO NOTHING`,
          [habitId, isoDate(date)]
        );
      }
    }
  }

  console.log("✅ Seed complete.");
  console.log("   Тестовый пользователь:");
  console.log(`     email:    ${TEST_EMAIL}`);
  console.log(`     password: ${TEST_PASSWORD}`);
  console.log("   Данные: 4 активные привычки, 1 архивная, 1 завершённая — за 90 дней истории.");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
