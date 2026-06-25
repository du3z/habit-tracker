import { useAuthStore } from "../store/auth.store.js";

export function useAuth() {
  const { user, token, loading, login, register, logout } = useAuthStore();
  return { user, token, loading, isAuthenticated: !!token, login, register, logout };
}
