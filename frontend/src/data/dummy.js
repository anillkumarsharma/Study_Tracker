// Central dummy data for the StudyLog UI.
// Later this gets replaced by API calls to the MERN backend.

export const user = {
  name: "Aarav Sharma",
  firstName: "Aarav",
  initial: "A",
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Each subject carries its own accent colour, reused across every chart & badge.
export const subjects = [
  { id: "math", name: "Mathematics", color: "#4C6EF5" },
  { id: "phy", name: "Physics", color: "#22A565" },
  { id: "chem", name: "Chemistry", color: "#E3A008" },
  { id: "eng", name: "English", color: "#EC4899" },
  { id: "bio", name: "Biology", color: "#06B6D4" },
];

export const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

// Planned hours per subject per day (null = no plan that day).
export const routine = {
  math: { Mon: 2, Tue: 1.5, Wed: null, Thu: null, Fri: 2, Sat: null, Sun: null },
  phy: { Mon: 1, Tue: null, Wed: null, Thu: 2, Fri: null, Sat: null, Sun: null },
  chem: { Mon: null, Tue: 1.5, Wed: null, Thu: null, Fri: null, Sat: 1.5, Sun: null },
  eng: { Mon: null, Tue: null, Wed: 1, Thu: null, Fri: null, Sat: null, Sun: null },
  bio: { Mon: null, Tue: null, Wed: 2, Thu: null, Fri: null, Sat: null, Sun: 1 },
};

// Planned vs actual hours across the current week (used by dashboard + analytics).
export const weeklyStats = [
  { day: "Mon", planned: 2.8, actual: 2.4 },
  { day: "Tue", planned: 3.0, actual: 3.2 },
  { day: "Wed", planned: 2.0, actual: 1.8 },
  { day: "Thu", planned: 1.8, actual: 2.0 },
  { day: "Fri", planned: 1.6, actual: 1.4 },
  { day: "Sat", planned: 1.5, actual: 1.8 },
  { day: "Sun", planned: 1.0, actual: 0.8 },
];

export const weeklyGoal = {
  target: 17,
  done: 16.5,
  percent: 72,
  note: "Almost there — 30 min left today",
};

export const todaysPlan = [
  { subjectId: "eng", planned: "1h", status: "In progress" },
  { subjectId: "bio", planned: "2h", status: "In progress" },
];

export const sessions = [
  {
    id: 1,
    subjectId: "math",
    topic: "Integration by parts",
    date: "3 Jul",
    duration: "1h 20m",
    note: "Solved 12 problems, revise limits again",
  },
  {
    id: 2,
    subjectId: "phy",
    topic: "Rotational motion",
    date: "3 Jul",
    duration: "45m",
    note: "Moment of inertia derivations",
  },
  {
    id: 3,
    subjectId: "chem",
    topic: "Chemical bonding",
    date: "2 Jul",
    duration: "1h 10m",
    note: "VSEPR theory, need more practice",
  },
  {
    id: 4,
    subjectId: "eng",
    topic: "Essay writing",
    date: "2 Jul",
    duration: "40m",
    note: "Practiced argumentative essays",
  },
  {
    id: 5,
    subjectId: "bio",
    topic: "Cell division",
    date: "1 Jul",
    duration: "1h 30m",
    note: "Mitosis vs meiosis comparison",
  },
];

// Total hours logged per subject (feeds the analytics donut). Sums to 142h.
export const subjectDistribution = [
  { subjectId: "math", hours: 40 },
  { subjectId: "phy", hours: 30 },
  { subjectId: "chem", hours: 28 },
  { subjectId: "eng", hours: 18 },
  { subjectId: "bio", hours: 26 },
];

export const reminders = [
  { id: 1, subjectId: "math", time: "17:00", enabled: true },
  { id: 2, subjectId: "phy", time: "19:30", enabled: true },
  { id: 3, subjectId: "chem", time: "20:15", enabled: false },
];

export const streak = {
  current: 7,
  best: 21,
  totalHours: 142,
};
