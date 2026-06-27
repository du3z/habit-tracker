import { habitGroupService } from "../services/habitGroup.service.js";

export const habitGroupController = {
  async list(req, res, next) {
    try {
      const groups = await habitGroupService.list(req.userId);
      res.json({ groups });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const group = await habitGroupService.create(req.userId, req.body);
      res.status(201).json({ group });
    } catch (err) {
      next(err);
    }
  },

  async forGroup(req, res, next) {
    try {
      const group = await habitGroupService.forGroup(req.userId, req.params.id);
      res.json({ group });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const group = await habitGroupService.update(req.userId, req.params.id, req.body);
      res.json({ group });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await habitGroupService.remove(req.userId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
