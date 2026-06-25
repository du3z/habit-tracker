import { api } from "./axios.js";

export const habitsApi = {
  list: () => api.get("/habits").then((r) => r.data.habits),
  create: (data) => api.post("/habits", data).then((r) => r.data.habit),
  update: (id, data) => api.put(`/habits/${id}`, data).then((r) => r.data.habit),
  remove: (id) => api.delete(`/habits/${id}`),
  toggle: (id, date) => api.post(`/habits/${id}/toggle`, { date }).then((r) => r.data.log),
  logs: (id) => api.get(`/habits/${id}/logs`).then((r) => r.data.logs),
};
