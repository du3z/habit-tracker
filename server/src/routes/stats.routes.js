import { Router } from "express";
import { statsController } from "../controllers/stats.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/overview", statsController.overview);
router.get("/history", statsController.history);
router.get("/weekly-report", statsController.weeklyReport);
router.get("/:habitId", statsController.forHabit);

export default router;
