import { create } from "zustand";
import { habitsApi } from "../api/habits.api.js";

export const useHabitStore = create((set, get) => ({
  habits: [],
  loading: false,
  filters: { search: "", type: "", archived: "false" },

  setFilters(partial) {
    set({ filters: { ...get().filters, ...partial } });
  },

  async fetchHabits(overrideFilters) {
    set({ loading: true });
    const filters = overrideFilters || get().filters;
    const habits = await habitsApi.list(filters);
    set({ habits, loading: false });
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

  async toggleHabit(id, date) {
    await habitsApi.toggle(id, date);
  },

  async archiveHabit(id) {
    await habitsApi.archive(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  async restoreHabit(id) {
    await habitsApi.restore(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },
}));
