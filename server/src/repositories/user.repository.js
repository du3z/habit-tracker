import { query } from "../config/db.js";

export const userRepository = {
  async create({ email, passwordHash }) {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT id, email, created_at FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },
};
