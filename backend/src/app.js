import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

// CLIENT_URL can be a comma-separated list of allowed origins (e.g. your
// Vercel URL). If it's unset, allow any origin — safe here because the API is
// protected by JWT bearer tokens, not cookies.
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : null;

app.use(cors({ origin: allowedOrigins || true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
});

export default app;
