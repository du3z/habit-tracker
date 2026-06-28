import { create } from "zustand";
import { habitsApi } from "../api/habits.api.js";
import { groupsApi } from "../api/groups.api.js";

export const useHabitStore = create((set, get) => ({
  habits: [],
  groups: [],
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

  async fetchGroups() {
    const groups = await groupsApi.list();
    set({ groups });
    return groups;
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
    const result = await habitsApi.toggle(id, date);
    set({
      habits: get().habits.map((h) =>
        h.id === id ? { ...h, completed_today: result.completed } : h
      ),
    });
    get().fetchGroups();
    return result;
  },

  async archiveHabit(id) {
    await habitsApi.archive(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
    get().fetchGroups();
  },

  async restoreHabit(id) {
    await habitsApi.restore(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  async completeHabit(id) {
    await habitsApi.complete(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
    get().fetchGroups();
  },

  async reopenHabit(id) {
    await habitsApi.reopen(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },
}));
