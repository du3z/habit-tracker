import bcrypt from "bcryptjs";
import { pool, query } from "../config/db.js";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  console.log("🌱 Seeding test data...");

  // очищаем старые тестовые данные
  await query(`DELETE FROM users WHERE email = $1`, [TEST_EMAIL]);

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const { rows: userRows } = await query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
    [TEST_EMAIL, passwordHash]
  );
  const userId = userRows[0].id;

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 60);

  const habitsToCreate = [
    {
      title: "Читать 30 минут",
      description: "Чтение книги перед сном",
      type: "daily",
      color: "#6366f1",
      target_days: 60,
      probability: 0.85, // высокая успешность
    },
    {
      title: "Тренировка",
      description: "Зал или домашняя тренировка",
      type: "daily",
      color: "#22c55e",
      target_days: 60,
      probability: 0.55,
    },
    {
      title: "Учить английский",
      description: "Анки + 15 минут практики",
      type: "daily",
      color: "#f59e0b",
      target_days: 60,
      probability: 0.3,
    },
  ];

  for (const h of habitsToCreate) {
    const { rows } = await query(
      `INSERT INTO habits (user_id, title, description, type, color, target_days, start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, h.title, h.description, h.type, h.color, h.target_days, isoDate(start)]
    );
    const habitId = rows[0].id;

    // генерируем логи за последние 60 дней по заданной вероятности,
    // но гарантируем текущий стрик: последние 5 дней — выполнено для первой привычки
    for (let i = 0; i <= 60; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      if (date > today) break;

      const daysAgo = Math.round((today - date) / (1000 * 60 * 60 * 24));
      const forcedStreak = h.title === "Читать 30 минут" && daysAgo <= 6;
      const completed = forcedStreak ? true : Math.random() < h.probability;

      if (completed) {
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

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
