import { api } from "./axios.js";

export const habitsApi = {
  list: (filters = {}) =>
    api.get("/habits", { params: filters }).then((r) => r.data.habits),
  create: (data) => api.post("/habits", data).then((r) => r.data.habit),
  update: (id, data) => api.put(`/habits/${id}`, data).then((r) => r.data.habit),
  remove: (id) => api.delete(`/habits/${id}`),
  toggle: (id, date) => api.post(`/habits/${id}/toggle`, { date }).then((r) => r.data.log),
  logs: (id) => api.get(`/habits/${id}/logs`).then((r) => r.data.logs),
  archive: (id) => api.put(`/habits/${id}`, { archived: true }).then((r) => r.data.habit),
  restore: (id) => api.put(`/habits/${id}`, { archived: false }).then((r) => r.data.habit),
  complete: (id) => api.post(`/habits/${id}/complete`).then((r) => r.data.habit),
  reopen: (id) => api.post(`/habits/${id}/reopen`).then((r) => r.data.habit),
};
