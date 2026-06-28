import { query } from "../config/db.js";

export const habitRepository = {
  async create(userId, data) {
    const { rows } = await query(
      `INSERT INTO habits (user_id, title, description, type, color, target_days, start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        data.title,
        data.description || null,
        data.type,
        data.color,
        data.target_days,
        data.start_date,
      ]
    );
    return rows[0];
  },

  async findAllByUser(userId, { view = "active", search = "", type = "" } = {}) {
    const conditions = ["user_id = $1"];
    const params = [userId];

    if (view === "active") {
      conditions.push("archived = false AND completed = false");
    } else if (view === "archived") {
      conditions.push("archived = true");
    } else if (view === "completed") {
      conditions.push("completed = true");
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    const { rows } = await query(
      `SELECT * FROM habits WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
      params
    );

    if (rows.length === 0) return rows;

    const todayStr = new Date().toISOString().slice(0, 10);
    const ids = rows.map((r) => r.id);
    const { rows: todayLogs } = await query(
      `SELECT habit_id FROM habit_logs WHERE habit_id = ANY($1) AND date = $2 AND completed = true`,
      [ids, todayStr]
    );
    const doneTodaySet = new Set(todayLogs.map((l) => l.habit_id));

    return rows.map((r) => ({ ...r, completed_today: doneTodaySet.has(r.id) }));
  },

  async findById(id) {
    const { rows } = await query(`SELECT * FROM habits WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async update(id, data) {
    const { rows } = await query(
      `UPDATE habits SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        color = COALESCE($4, color),
        target_days = COALESCE($5, target_days),
        start_date = COALESCE($6, start_date),
        archived = COALESCE($7, archived)
       WHERE id = $8
       RETURNING *`,
      [
        data.title,
        data.description,
        data.type,
        data.color,
        data.target_days,
        data.start_date,
        data.archived,
        id,
      ]
    );
    return rows[0] || null;
  },

  async markCompleted(id) {
    const { rows } = await query(
      `UPDATE habits SET completed = true, completed_at = now(), archived = false
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0] || null;
  },

  async markActive(id) {
    const { rows } = await query(
      `UPDATE habits SET completed = false, completed_at = NULL
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0] || null;
  },

  async remove(id) {
    await query(`DELETE FROM habits WHERE id = $1`, [id]);
  },
};
