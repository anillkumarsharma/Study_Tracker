import Subject from "../models/Subject.js";
import Session from "../models/Session.js";
import Routine from "../models/Routine.js";
import { DAYS, weekdayLabel, startOfWeek, round1 } from "../utils/format.js";

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

    // --- Actual per weekday for THIS calendar week (Mon 00:00 -> next Mon) ---
    // Same window the Routine grid uses, so the two never disagree and a
    // weekday can't be counted twice (e.g. last Friday + this Friday).
    const weekStart = startOfWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const actual = Object.fromEntries(DAYS.map((d) => [d, 0]));
    for (const s of sessions) {
      const when = new Date(s.date);
      if (when >= weekStart && when < weekEnd) {
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

    // --- Streak: consecutive days with a session, up to today ---
    const dayKeys = new Set(
      sessions.map((s) => new Date(s.date).toDateString())
    );
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    // If nothing is logged today yet, the streak isn't broken — the day isn't
    // over. Start counting from yesterday so it stays alive until midnight.
    if (!dayKeys.has(cursor.toDateString())) {
      cursor.setDate(cursor.getDate() - 1);
    }
    let current = 0;
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
