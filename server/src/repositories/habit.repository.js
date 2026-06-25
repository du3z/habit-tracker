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

  async findAllByUser(userId, { includeArchived = false, search = "", type = "" } = {}) {
    const conditions = ["user_id = $1"];
    const params = [userId];

    if (!includeArchived) {
      conditions.push("archived = false");
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
    return rows;
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

  async remove(id) {
    await query(`DELETE FROM habits WHERE id = $1`, [id]);
  },
};
