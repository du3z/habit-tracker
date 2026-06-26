import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const ALLOWED_EMAIL_DOMAINS = ["gmail.com", "mail.ru", "yandex.ru"];

const registerSchema = z
  .object({
    email: z
      .string()
      .email("Некорректный email")
      .toLowerCase()
      .refine(
        (value) => ALLOWED_EMAIL_DOMAINS.some((domain) => value.endsWith(`@${domain}`)),
        {
          message: `Регистрация доступна только с почты: ${ALLOWED_EMAIL_DOMAINS.join(", ")}`,
        }
      ),
    password: z.string().min(6, "Минимум 6 символов"),
    passwordConfirm: z.string().min(6, "Минимум 6 символов"),
    agreeTerms: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Пароли не совпадают",
    path: ["passwordConfirm"],
  })
  .refine((data) => data.agreeTerms === true, {
    message: "Нужно согласиться с условиями использования",
    path: ["agreeTerms"],
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
