import { api } from "./axios.js";

export const statsApi = {
  overview: () => api.get("/stats/overview").then((r) => r.data),
  forHabit: (habitId) => api.get(`/stats/${habitId}`).then((r) => r.data),
  history: (limit = 200, onlyActive = false) =>
    api.get("/stats/history", { params: { limit, onlyActive } }).then((r) => r.data.history),
};
