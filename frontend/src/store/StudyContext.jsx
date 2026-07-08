import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { startOfWeek, weekdayLabel } from "../utils/dates";
import {
  subjectsApi,
  routineApi,
  sessionsApi,
  remindersApi,
  examsApi,
  analyticsApi,
} from "../api/studyApi";

const StudyContext = createContext(null);

const EMPTY_SUMMARY = {
  subjectDistribution: [],
  weeklyStats: [],
  weeklyGoal: { target: 0, done: 0, percent: 0 },
  streak: { current: 0, totalHours: 0 },
};

export function StudyProvider({ children }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [routine, setRoutine] = useState({});
  const [sessions, setSessions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [exams, setExams] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);

  const subjectById = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  // Actual hours studied THIS week, grouped as { subjectId: { Mon: 2, ... } }.
  // Auto-derived from logged sessions, so the routine grid fills itself as you
  // save time-log sessions. Resets naturally when a new week starts.
  const weeklyActuals = useMemo(() => {
    const weekStart = startOfWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const grid = {};
    for (const sess of sessions) {
      const when = new Date(sess.dateISO);
      if (when < weekStart || when >= weekEnd) continue;
      const day = weekdayLabel(when);
      const cell = (grid[sess.subjectId] ||= {});
      cell[day] = (cell[day] || 0) + sess.durationMins / 60;
    }
    return grid;
  }, [sessions]);

  const refreshSummary = useCallback(async () => {
    try {
      setSummary(await analyticsApi.summary());
    } catch {
      /* keep last summary on transient errors */
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, rt, sess, rem, ex, sum] = await Promise.all([
        subjectsApi.list(),
        routineApi.get(),
        sessionsApi.list(),
        remindersApi.list(),
        examsApi.list(),
        analyticsApi.summary(),
      ]);
      setSubjects(subs);
      setRoutine(rt);
      setSessions(sess);
      setReminders(rem);
      setExams(ex);
      setSummary(sum);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAll();
    } else {
      setSubjects([]);
      setRoutine({});
      setSessions([]);
      setReminders([]);
      setExams([]);
      setSummary(EMPTY_SUMMARY);
    }
  }, [user, loadAll]);

  const actions = {
    async addSubject(name) {
      const clean = name.trim();
      if (!clean) return;
      const subject = await subjectsApi.create(clean);
      setSubjects((prev) => [...prev, subject]);
    },

    async deleteSubject(id) {
      await subjectsApi.remove(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setRoutine((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      refreshSummary();
    },

    async setRoutineCell(subjectId, day, hours) {
      await routineApi.setCell(subjectId, day, hours);
      setRoutine((prev) => {
        const next = { ...prev, [subjectId]: { ...(prev[subjectId] || {}) } };
        if (hours && hours > 0) next[subjectId][day] = hours;
        else delete next[subjectId][day];
        return next;
      });
      refreshSummary();
    },

    async addSession(payload) {
      const session = await sessionsApi.create(payload);
      setSessions((prev) => [session, ...prev]);
      refreshSummary();
    },

    async deleteSession(id) {
      await sessionsApi.remove(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      refreshSummary();
    },

    async addReminder(payload) {
      const reminder = await remindersApi.create(payload);
      setReminders((prev) => [...prev, reminder]);
    },

    async toggleReminder(id) {
      const updated = await remindersApi.toggle(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    },

    async deleteReminder(id) {
      await remindersApi.remove(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    },

    async addExam(payload) {
      const exam = await examsApi.create(payload);
      setExams((prev) =>
        [...prev, exam].sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    },

    async deleteExam(id) {
      await examsApi.remove(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    },

    refreshSummary,
  };

  const value = {
    subjects,
    subjectById,
    routine,
    weeklyActuals,
    sessions,
    reminders,
    exams,
    summary,
    loading,
    ...actions,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within <StudyProvider>");
  return ctx;
}
