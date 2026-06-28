import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const ALLOWED_DOMAINS = ["gmail.com", "mail.ru", "yandex.ru"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function clientSideError() {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
      return `Регистрация доступна только с почты: ${ALLOWED_DOMAINS.join(", ")}`;
    }
    if (password !== passwordConfirm) {
      return "Пароли не совпадают";
    }
    if (!agreeTerms) {
      return "Нужно согласиться с условиями использования";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clientError = clientSideError();
    if (clientError) {
      setError(clientError);
      return;
    }

    setLoading(true);
    try {
      await register(email, password, passwordConfirm, agreeTerms);

      navigate("/login", { state: { registered: true, email } });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const firstError = apiErrors && Object.values(apiErrors).flat()[0];
      setError(firstError || err.response?.data?.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-100">Регистрация</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Доступна почта только: {ALLOWED_DOMAINS.join(", ")}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <label className="text-sm text-slate-600 dark:text-slate-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@gmail.com"
          className="w-full mt-1 mb-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
          required
        />

        <label className="text-sm text-slate-600 dark:text-slate-300">Пароль (мин. 6 символов)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 mb-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
          minLength={6}
          required
        />

        <label className="text-sm text-slate-600 dark:text-slate-300">Повторите пароль</label>
        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full mt-1 mb-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
          minLength={6}
          required
        />

        <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5"
          />
          <span>Я согласен с условиями использования</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Создаём..." : "Зарегистрироваться"}
        </button>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
