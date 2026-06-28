import { query } from "../config/db.js";

export const habitGroupRepository = {
  async create(userId, { title, color }) {
    const { rows } = await query(
      `INSERT INTO habit_groups (user_id, title, color) VALUES ($1, $2, $3) RETURNING *`,
      [userId, title, color]
    );
    return rows[0];
  },

  async findAllByUser(userId) {
    const { rows } = await query(
      `SELECT * FROM habit_groups WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(`SELECT * FROM habit_groups WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async update(id, { title, color }) {
    const { rows } = await query(
      `UPDATE habit_groups SET title = COALESCE($1, title), color = COALESCE($2, color)
       WHERE id = $3 RETURNING *`,
      [title, color, id]
    );
    return rows[0] || null;
  },

  async remove(id) {

    await query(`DELETE FROM habit_groups WHERE id = $1`, [id]);
  },

  async findMembers(groupId) {
    const { rows } = await query(
      `SELECT * FROM habits WHERE group_id = $1 ORDER BY created_at ASC`,
      [groupId]
    );
    return rows;
  },

  async clearMembers(groupId) {
    await query(`UPDATE habits SET group_id = NULL WHERE group_id = $1`, [groupId]);
  },

  async setMembers(groupId, userId, habitIds) {
    await this.clearMembers(groupId);
    if (habitIds.length === 0) return;
    await query(
      `UPDATE habits SET group_id = $1 WHERE id = ANY($2) AND user_id = $3`,
      [groupId, habitIds, userId]
    );
  },
};
