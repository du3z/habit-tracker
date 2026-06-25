import { authService } from "../services/auth.service.js";

export const authController = {
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.me(req.userId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
};
