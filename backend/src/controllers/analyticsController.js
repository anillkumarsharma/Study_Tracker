import Subject from "../models/Subject.js";
import Session from "../models/Session.js";
import Routine from "../models/Routine.js";
import { DAYS, weekdayLabel, round1 } from "../utils/format.js";

// GET /api/analytics/summary
// Everything the Dashboard + Analytics pages need, computed from real data.
export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [subjects, sessions, routines] = await Promise.all([
      Subject.find({ user: userId }).sort({ createdAt: 1 }),
      Session.find({ user: userId }),
      Routine.find({ user: userId }),
    ]);

    // --- Subject-wise distribution (total hours logged per subject) ---
    const hoursBySubject = {};
    for (const s of sessions) {
      const sid = s.subject.toString();
      hoursBySubject[sid] = (hoursBySubject[sid] || 0) + s.durationMins;
    }
    const subjectDistribution = subjects.map((sub) => ({
      subjectId: sub._id,
      name: sub.name,
      color: sub.color,
      hours: round1((hoursBySubject[sub._id.toString()] || 0) / 60),
    }));

    // --- Planned per weekday (sum of routine hours) ---
    const planned = Object.fromEntries(DAYS.map((d) => [d, 0]));
    for (const r of routines) planned[r.day] += r.hours;

    // --- Actual per weekday for the last 7 days ---
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const actual = Object.fromEntries(DAYS.map((d) => [d, 0]));
    for (const s of sessions) {
      if (new Date(s.date) >= weekAgo) {
        actual[weekdayLabel(s.date)] += s.durationMins / 60;
      }
    }

    const weeklyStats = DAYS.map((day) => ({
      day,
      planned: round1(planned[day]),
      actual: round1(actual[day]),
    }));

    // --- Weekly goal ---
    // Custom goal (weeklyGoalHours) wins; otherwise use the routine's plan.
    const plannedTotal = round1(
      Object.values(planned).reduce((a, b) => a + b, 0)
    );
    const target = req.user.weeklyGoalHours > 0
      ? round1(req.user.weeklyGoalHours)
      : plannedTotal;
    const done = round1(Object.values(actual).reduce((a, b) => a + b, 0));
    const percent = target > 0 ? Math.round((done / target) * 100) : 0;

    // --- Streak: consecutive days (ending today) that have a session ---
    const dayKeys = new Set(
      sessions.map((s) => new Date(s.date).toDateString())
    );
    let current = 0;
    const cursor = new Date();
    while (dayKeys.has(cursor.toDateString())) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    const totalHours = round1(
      sessions.reduce((a, s) => a + s.durationMins, 0) / 60
    );

    res.json({
      subjectDistribution,
      weeklyStats,
      weeklyGoal: { target, done, percent },
      streak: { current, totalHours },
    });
  } catch (err) {
    next(err);
  }
};
