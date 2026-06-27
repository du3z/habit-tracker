import { api } from "./axios.js";

export const groupsApi = {
  list: () => api.get("/groups").then((r) => r.data.groups),
  create: (data) => api.post("/groups", data).then((r) => r.data.group),
  forGroup: (id) => api.get(`/groups/${id}`).then((r) => r.data.group),
  update: (id, data) => api.put(`/groups/${id}`, data).then((r) => r.data.group),
  remove: (id) => api.delete(`/groups/${id}`),
};
