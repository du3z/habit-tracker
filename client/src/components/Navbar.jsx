import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="font-bold text-indigo-600 dark:text-indigo-400 tracking-tight hover:opacity-80 transition-opacity"
        >
          Habit Tracker
        </Link>
        <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
          Дашборд
        </Link>
        <Link to="/analytics" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
          Аналитика
        </Link>
        <Link to="/history" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
          История
        </Link>
        <Link to="/motivation" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">
          Мотивация
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</span>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}
