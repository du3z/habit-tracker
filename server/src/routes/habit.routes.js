import { Router } from "express";
import { z } from "zod";
import { habitController } from "../controllers/habit.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

const habitSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  type: z.enum(["daily", "weekly", "custom"]).default("daily"),
  color: z.string().default("#6366f1"),
  target_days: z.number().int().positive().default(30),
  start_date: z.string().default(() => new Date().toISOString().slice(0, 10)),
});

const habitUpdateSchema = habitSchema.partial().extend({
  archived: z.boolean().optional(),
});

const toggleSchema = z.object({
  date: z.string().optional(),
});

router.use(authMiddleware);

router.get("/", habitController.list);
router.post("/", validate(habitSchema), habitController.create);
router.put("/:id", validate(habitUpdateSchema), habitController.update);
router.delete("/:id", habitController.remove);
router.post("/:id/toggle", validate(toggleSchema), habitController.toggle);
router.get("/:id/logs", habitController.logs);

export default router;
