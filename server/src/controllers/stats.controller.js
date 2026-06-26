import { statsService } from "../services/stats.service.js";

export const statsController = {
  async overview(req, res, next) {
    try {
      const data = await statsService.overview(req.userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async forHabit(req, res, next) {
    try {
      const data = await statsService.forHabit(req.userId, req.params.habitId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async history(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 200;
      const onlyActive = req.query.onlyActive === "true";
      const history = await statsService.history(req.userId, limit, { onlyActive });
      res.json({ history });
    } catch (err) {
      next(err);
    }
  },
};
