const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Today as a local "YYYY-MM-DD" string, for <input type="date" min=...>.
export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}

// Monday 00:00 of the week that contains `date` (defaults to now).
export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0 = Sun. Days to subtract to reach Monday.
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return d;
}

// Our Mon-first weekday label for a date. getDay(): 0 = Sun.
export const weekdayLabel = (date) => DAYS[(new Date(date).getDay() + 6) % 7];

// Whole days from today (midnight) until the given date. Past = negative.
export function daysUntil(date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

export function formatExamDate(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// "in 12 days" / "Tomorrow" / "Today" / "Past"
export function countdownLabel(date) {
  const d = daysUntil(date);
  if (d < 0) return "Past";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `in ${d} days`;
}

// Live time left until the END of the exam day, broken into d/h/m/s.
// `over` is true once the exam day has fully passed. Pass `now` so a ticking
// component re-computes every second.
export function countdownParts(date, now = new Date()) {
  const target = new Date(date);
  target.setHours(23, 59, 59, 999); // count down to the end of the exam day
  let diff = Math.floor((target - now) / 1000); // seconds remaining

  if (diff <= 0) return { over: true, days: 0, hours: 0, mins: 0, secs: 0 };

  const days = Math.floor(diff / 86400);
  diff -= days * 86400;
  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;
  const mins = Math.floor(diff / 60);
  const secs = diff - mins * 60;

  return { over: false, days, hours, mins, secs };
}
