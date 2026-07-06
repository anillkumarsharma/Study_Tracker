const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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
