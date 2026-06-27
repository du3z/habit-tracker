import { Router } from "express";
import { z } from "zod";
import { habitGroupController } from "../controllers/habitGroup.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

const groupSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  color: z.string().default("#6366f1"),
  habitIds: z.array(z.string().uuid()).min(2, "Нужно выбрать минимум 2 привычки"),
});

const groupUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  color: z.string().optional(),
  habitIds: z.array(z.string().uuid()).min(2).optional(),
});

router.use(authMiddleware);

router.get("/", habitGroupController.list);
router.post("/", validate(groupSchema), habitGroupController.create);
router.get("/:id", habitGroupController.forGroup);
router.put("/:id", validate(groupUpdateSchema), habitGroupController.update);
router.delete("/:id", habitGroupController.remove);

export default router;
