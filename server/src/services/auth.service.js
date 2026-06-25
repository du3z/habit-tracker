import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";
import { env } from "../config/env.js";

const TOKEN_EXPIRES_IN = "7d";

export const authService = {
  async register({ email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const err = new Error("Email уже зарегистрирован");
      err.status = 409;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, passwordHash });
    const token = signToken(user.id);
    return { user, token };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error("Неверный email или пароль");
      err.status = 401;
      throw err;
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const err = new Error("Неверный email или пароль");
      err.status = 401;
      throw err;
    }
    const token = signToken(user.id);
    return {
      user: { id: user.id, email: user.email, created_at: user.created_at },
      token,
    };
  },

  async me(userId) {
    return userRepository.findById(userId);
  },
};

function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: TOKEN_EXPIRES_IN });
}
