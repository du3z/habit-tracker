import { query } from "../config/db.js";

export const habitLogRepository = {
  async findByHabit(habitId) {
    const { rows } = await query(
      `SELECT * FROM habit_logs WHERE habit_id = $1 ORDER BY date ASC`,
      [habitId]
    );
    return rows;
  },

  async findOne(habitId, date) {
    const { rows } = await query(
      `SELECT * FROM habit_logs WHERE habit_id = $1 AND date = $2`,
      [habitId, date]
    );
    return rows[0] || null;
  },

  async upsertToggle(habitId, date) {
    const existing = await this.findOne(habitId, date);
    if (existing) {
      await query(`DELETE FROM habit_logs WHERE id = $1`, [existing.id]);
      return { date, completed: false };
    }
    await query(
      `INSERT INTO habit_logs (habit_id, date, completed) VALUES ($1, $2, true)`,
      [habitId, date]
    );
    return { date, completed: true };
  },

  async findCompletedHistory(userId, limit = 200, { onlyActive = false } = {}) {
    const statusFilter = onlyActive ? "AND h.archived = false AND h.completed = false" : "";
    const { rows } = await query(
      `SELECT hl.date, hl.created_at, h.id AS habit_id, h.title, h.color
       FROM habit_logs hl
       JOIN habits h ON h.id = hl.habit_id
       WHERE h.user_id = $1 AND hl.completed = true ${statusFilter}
       ORDER BY hl.date DESC, hl.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  },
};
