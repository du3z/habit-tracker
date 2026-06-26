import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;
  const [email, setEmail] = useState(location.state?.email || "test@example.com");
  const [password, setPassword] = useState(justRegistered ? "" : "password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка входа");
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
        <h1 className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-100">Вход</h1>

        {justRegistered ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-md px-3 py-2 mb-4">
            Регистрация прошла успешно! Теперь войдите в свой аккаунт.
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Тестовый аккаунт уже заполнен — просто нажмите «Войти».
          </p>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md px-3 py-2 mb-4">{error}</div>
        )}

        <label className="text-sm text-slate-600 dark:text-slate-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 mb-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
          required
        />

        <label className="text-sm text-slate-600 dark:text-slate-300">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 mb-6 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
