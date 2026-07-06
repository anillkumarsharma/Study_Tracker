import client from "./client";

const data = (r) => r.data;

export const authApi = {
  login: (name, username) =>
    client.post("/auth/login", { name, username }).then(data),
  me: () => client.get("/auth/me").then(data),
  updateGoal: (weeklyGoalHours) =>
    client.patch("/auth/goal", { weeklyGoalHours }).then(data),
};

export const subjectsApi = {
  list: () => client.get("/subjects").then(data),
  create: (name) => client.post("/subjects", { name }).then(data),
  remove: (id) => client.delete(`/subjects/${id}`).then(data),
};

export const routineApi = {
  get: () => client.get("/routines").then(data),
  setCell: (subjectId, day, hours) =>
    client.put("/routines", { subjectId, day, hours }).then(data),
};

export const sessionsApi = {
  list: () => client.get("/sessions").then(data),
  create: (payload) => client.post("/sessions", payload).then(data),
  remove: (id) => client.delete(`/sessions/${id}`).then(data),
};

export const remindersApi = {
  list: () => client.get("/reminders").then(data),
  create: (payload) => client.post("/reminders", payload).then(data),
  toggle: (id) => client.patch(`/reminders/${id}/toggle`).then(data),
  remove: (id) => client.delete(`/reminders/${id}`).then(data),
};

export const examsApi = {
  list: () => client.get("/exams").then(data),
  create: (payload) => client.post("/exams", payload).then(data),
  remove: (id) => client.delete(`/exams/${id}`).then(data),
};

export const analyticsApi = {
  summary: () => client.get("/analytics/summary").then(data),
};
