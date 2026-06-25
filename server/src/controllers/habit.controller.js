import { habitService } from "../services/habit.service.js";

export const habitController = {
  async list(req, res, next) {
    try {
      const { search = "", type = "", archived } = req.query;
      const includeArchived = archived === "true" || archived === "only";
      let habits = await habitService.list(req.userId, { includeArchived, search, type });
      if (archived === "only") {
        habits = habits.filter((h) => h.archived);
      }
      res.json({ habits });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const habit = await habitService.create(req.userId, req.body);
      res.status(201).json({ habit });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const habit = await habitService.update(req.userId, req.params.id, req.body);
      res.json({ habit });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await habitService.remove(req.userId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async toggle(req, res, next) {
    try {
      const date = req.body.date || new Date().toISOString().slice(0, 10);
      const result = await habitService.toggle(req.userId, req.params.id, date);
      res.json({ log: result });
    } catch (err) {
      next(err);
    }
  },

  async logs(req, res, next) {
    try {
      const logs = await habitService.logs(req.userId, req.params.id);
      res.json({ logs });
    } catch (err) {
      next(err);
    }
  },
};
