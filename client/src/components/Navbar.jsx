import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-indigo-600">🔥 Habit Tracker</span>
        <Link to="/" className="text-slate-600 hover:text-indigo-600 text-sm">
          Дашборд
        </Link>
        <Link to="/analytics" className="text-slate-600 hover:text-indigo-600 text-sm">
          Аналитика
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}
