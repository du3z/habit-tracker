import { create } from "zustand";
import { authApi } from "../api/auth.api.js";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: true,

  async init() {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { user } = await authApi.me();
      set({ user, token, loading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },

  async login(email, password) {
    const { user, token } = await authApi.login({ email, password });
    localStorage.setItem("token", token);
    set({ user, token });
  },

  async register(email, password, passwordConfirm, agreeTerms) {
    const { user } = await authApi.register({ email, password, passwordConfirm, agreeTerms });
    return user;
  },

  logout() {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
