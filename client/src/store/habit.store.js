import { create } from "zustand";
import { habitsApi } from "../api/habits.api.js";

export const useHabitStore = create((set, get) => ({
  habits: [],
  loading: false,

  async fetchHabits() {
    set({ loading: true });
    const habits = await habitsApi.list();
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
}));
