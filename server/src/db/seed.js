import bcrypt from "bcryptjs";
import { pool, query } from "../config/db.js";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";
const DAYS_HISTORY = 90;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const profiles = {
  high: () => 0.85,
  mediumHigh: () => 0.65,
  medium: () => 0.5,
  low: () => 0.3,
  veryLow: () => 0.18,

  rising: (daysAgo) => 0.4 + ((DAYS_HISTORY - daysAgo) / DAYS_HISTORY) * 0.45,

  weekdayHeavy: (daysAgo, date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isWeekend ? 0.2 : 0.7;
  },

  weekendHeavy: (daysAgo, date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isWeekend ? 0.8 : 0.35;
  },

  dipAndRecover: (daysAgo) => (daysAgo > 30 && daysAgo < 55 ? 0.05 : 0.45),

  volatile: (daysAgo) => (Math.floor(daysAgo / 5) % 2 === 0 ? 0.7 : 0.2),
};

const ACTIVE_HABITS = [
  { title: "Читать 30 минут", description: "Чтение книги перед сном", type: "daily", color: "#6366f1", profile: "rising", forcedRecentStreakDays: 6, todayCompleted: true },
  { title: "Тренировка", description: "Зал или домашняя тренировка", type: "custom", color: "#22c55e", profile: "weekdayHeavy", todayCompleted: false },
  { title: "Учить английский", description: "Анки + 15 минут практики", type: "daily", color: "#f59e0b", profile: "dipAndRecover", forcedRecentStreakDays: 3, todayCompleted: true },
  { title: "Медитация", description: "10 минут осознанности по утрам", type: "weekly", color: "#ec4899", profile: "medium", todayCompleted: false },
  { title: "Пить 2 литра воды", description: "Следить за водным балансом", type: "daily", color: "#0ea5e9", profile: "high", todayCompleted: true },
  { title: "Спать 8 часов", description: "Ложиться не позже 23:00", type: "daily", color: "#8b5cf6", profile: "mediumHigh", todayCompleted: false },
  { title: "Вести дневник", description: "Пара строк перед сном", type: "daily", color: "#f43f5e", profile: "low", todayCompleted: false },
  { title: "Гулять на улице", description: "Минимум 20 минут пешком", type: "custom", color: "#84cc16", profile: "weekendHeavy", todayCompleted: true },
  { title: "Учить программирование", description: "Код-практика каждый день", type: "daily", color: "#06b6d4", profile: "rising", forcedRecentStreakDays: 8, todayCompleted: true },
  { title: "Без соцсетей до обеда", description: "Телефон в другой комнате с утра", type: "daily", color: "#f97316", profile: "volatile", todayCompleted: false },
];

const ARCHIVED_HABITS = [
  { title: "Бросить сладкое", description: "Старая привычка, уже не отслеживается", color: "#94a3b8", profile: "low", endedDaysAgo: 60 },
  { title: "Бегать по утрам", description: "5 км перед работой", color: "#a8a29e", profile: "mediumHigh", endedDaysAgo: 45 },
  { title: "Учить испанский", description: "Duolingo каждый день", color: "#cbd5e1", profile: "low", endedDaysAgo: 70 },
  { title: "Питаться по плану", description: "Готовка наперёд на неделю", color: "#d4d4d8", profile: "medium", endedDaysAgo: 35 },
  { title: "Рисовать каждый день", description: "Скетчбук на 15 минут", color: "#bae6fd", profile: "veryLow", endedDaysAgo: 80 },
  { title: "Йога перед сном", description: "Растяжка 10 минут", color: "#fbcfe8", profile: "medium", endedDaysAgo: 50 },
  { title: "Считать калории", description: "Трекер еды", color: "#fde68a", profile: "mediumHigh", endedDaysAgo: 40 },
  { title: "Холодный душ", description: "Контрастное закаливание", color: "#a5f3fc", profile: "low", endedDaysAgo: 65 },
  { title: "Вести бюджет", description: "Запись трат каждый вечер", color: "#d9f99d", profile: "medium", endedDaysAgo: 30 },
  { title: "Учить гитару", description: "15 минут аккордов", color: "#fed7aa", profile: "veryLow", endedDaysAgo: 75 },
];

const COMPLETED_HABITS = [
  { title: "Отжимания 100 раз в день", description: "Челлендж на 30 дней — цель достигнута!", color: "#0ea5e9", profile: "high", startedDaysAgo: 50, endedDaysAgo: 20 },
  { title: "Без кофе 21 день", description: "Эксперимент с отказом от кофеина", color: "#b45309", profile: "high", startedDaysAgo: 40, endedDaysAgo: 19 },
  { title: "Стакан воды натощак", description: "14 дней привычки с утра", color: "#0891b2", profile: "high", startedDaysAgo: 30, endedDaysAgo: 16 },
  { title: "Утренняя растяжка", description: "30 дней растяжки после пробуждения", color: "#db2777", profile: "high", startedDaysAgo: 55, endedDaysAgo: 25 },
  { title: "Чтение перед сном 21 день", description: "Челлендж по чтению — выполнен", color: "#4f46e5", profile: "mediumHigh", startedDaysAgo: 45, endedDaysAgo: 24 },
  { title: "Без сахара 14 дней", description: "Короткий детокс-челлендж", color: "#ea580c", profile: "high", startedDaysAgo: 25, endedDaysAgo: 11 },
  { title: "Планка каждый день", description: "30 дней планки — цель достигнута", color: "#16a34a", profile: "mediumHigh", startedDaysAgo: 60, endedDaysAgo: 30 },
  { title: "Ранний подъём в 6:00", description: "21 день раннего подъёма", color: "#7c3aed", profile: "mediumHigh", startedDaysAgo: 35, endedDaysAgo: 14 },
  { title: "Контрастный душ 14 дней", description: "Короткий челлендж закаливания", color: "#0d9488", profile: "high", startedDaysAgo: 20, endedDaysAgo: 6 },
  { title: "Дыхательная практика", description: "30 дней дыхательных упражнений", color: "#c026d3", profile: "mediumHigh", startedDaysAgo: 65, endedDaysAgo: 35 },
];

const RITUALS = [
  { title: "Утренний ритуал", color: "#8b5cf6", members: ["Медитация", "Пить 2 литра воды", "Вести дневник"] },
  { title: "ЗОЖ-комбо", color: "#22c55e", members: ["Тренировка", "Спать 8 часов", "Гулять на улице"] },
  { title: "Цифровая гигиена", color: "#f97316", members: ["Без соцсетей до обеда", "Учить программирование"] },
];

async function insertHabit(userId, def, { startDate, archived = false, completed = false, completedAt = null }) {
  const { rows } = await query(
    `INSERT INTO habits (user_id, title, description, type, color, target_days, start_date, archived, completed, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [
      userId,
      def.title,
      def.description,
      def.type || "daily",
      def.color,
      def.target_days || 30,
      isoDate(startDate),
      archived,
      completed,
      completedAt ? isoDate(completedAt) : null,
    ]
  );
  return rows[0].id;
}

async function insertLogsBatch(habitId, dateStrings) {
  if (dateStrings.length === 0) return;
  await query(
    `INSERT INTO habit_logs (habit_id, date, completed)
     SELECT $1, d, true FROM UNNEST($2::date[]) AS d
     ON CONFLICT (habit_id, date) DO NOTHING`,
    [habitId, dateStrings]
  );
}

function generateDates(today, def, { startedDaysAgo, endedDaysAgo = 0 }) {
  const probFn = profiles[def.profile];
  const dates = [];
  const fromDaysAgo = startedDaysAgo !== undefined ? startedDaysAgo : DAYS_HISTORY;

  for (let daysAgo = fromDaysAgo; daysAgo >= endedDaysAgo; daysAgo--) {
    const date = addDays(today, -daysAgo);
    const forced = def.forcedRecentStreakDays && daysAgo <= def.forcedRecentStreakDays;
    let isCompleted = forced ? true : Math.random() < probFn(daysAgo, date);
    if (daysAgo === 0 && typeof def.todayCompleted === "boolean") {
      isCompleted = def.todayCompleted;
    }
    if (isCompleted) dates.push(isoDate(date));
  }
  return dates;
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
  const habitIdByTitle = {};

  for (const def of ACTIVE_HABITS) {
    const startDate = addDays(today, -DAYS_HISTORY);
    const habitId = await insertHabit(userId, def, { startDate });
    habitIdByTitle[def.title] = habitId;
    const dates = generateDates(today, def, { startedDaysAgo: DAYS_HISTORY, endedDaysAgo: 0 });
    await insertLogsBatch(habitId, dates);
  }

  for (const def of ARCHIVED_HABITS) {
    const startDate = addDays(today, -DAYS_HISTORY);
    const habitId = await insertHabit(userId, def, { startDate, archived: true });
    const dates = generateDates(today, def, { startedDaysAgo: DAYS_HISTORY, endedDaysAgo: def.endedDaysAgo });
    await insertLogsBatch(habitId, dates);
  }

  for (const def of COMPLETED_HABITS) {
    const startDate = addDays(today, -def.startedDaysAgo);
    const completedAt = addDays(today, -def.endedDaysAgo);
    const habitId = await insertHabit(userId, def, { startDate, completed: true, completedAt });
    const dates = generateDates(today, def, { startedDaysAgo: def.startedDaysAgo, endedDaysAgo: def.endedDaysAgo });
    await insertLogsBatch(habitId, dates);
  }

  for (const ritual of RITUALS) {
    const { rows } = await query(
      `INSERT INTO habit_groups (user_id, title, color) VALUES ($1, $2, $3) RETURNING id`,
      [userId, ritual.title, ritual.color]
    );
    const groupId = rows[0].id;
    const memberIds = ritual.members.map((title) => habitIdByTitle[title]).filter(Boolean);
    if (memberIds.length > 0) {
      await query(`UPDATE habits SET group_id = $1 WHERE id = ANY($2)`, [groupId, memberIds]);
    }
  }

  console.log("✅ Seed complete.");
  console.log("   Тестовый пользователь:");
  console.log(`     email:    ${TEST_EMAIL}`);
  console.log(`     password: ${TEST_PASSWORD}`);
  console.log(
    `   Данные: ${ACTIVE_HABITS.length} активных, ${ARCHIVED_HABITS.length} архивных, ${COMPLETED_HABITS.length} завершённых привычек, ${RITUALS.length} ритуала(ов).`
  );

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
