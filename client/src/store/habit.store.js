import { create } from "zustand";
import { habitsApi } from "../api/habits.api.js";

export const useHabitStore = create((set, get) => ({
  habits: [],
  loading: false,
  filters: { search: "", type: "", view: "active" },

  setFilters(partial) {
    set({ filters: { ...get().filters, ...partial } });
  },

  async fetchHabits(overrideFilters) {
    set({ loading: true });
    const filters = overrideFilters || get().filters;
    const habits = await habitsApi.list(filters);
    set({ habits, loading: false });
    return habits;
  },

  async createHabit(data) {
    const habit = await habitsApi.create(data);
    set({ habits: [habit, ...get().habits] });
    return habit;
  },

  async updateHabit(id, data) {
    const habit = await habitsApi.update(id, data);
    set({ habits: get().habits.map((h) => (h.id === id ? habit : h)) });
  },

  async removeHabit(id) {
    await habitsApi.remove(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  // возвращает подтверждённый сервером результат { date, completed },
  // чтобы UI не угадывал состояние, а брал его напрямую из ответа API
  async toggleHabit(id, date) {
    const result = await habitsApi.toggle(id, date);
    return result;
  },

  async archiveHabit(id) {
    await habitsApi.archive(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  async restoreHabit(id) {
    await habitsApi.restore(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  async completeHabit(id) {
    await habitsApi.complete(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  async reopenHabit(id) {
    await habitsApi.reopen(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },
}));
