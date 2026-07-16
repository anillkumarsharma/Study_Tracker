export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// JS getDay(): 0 = Sunday. Convert to our Mon-first label.
export const weekdayLabel = (date) => DAYS[(new Date(date).getDay() + 6) % 7];

// Monday 00:00 of the week that contains `date` (defaults to now).
export const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const back = (d.getDay() + 6) % 7; // days back to Monday
  d.setDate(d.getDate() - back);
  return d;
};

// 80 -> "1h 20m", 45 -> "45m"
export const formatDuration = (mins) => {
  const total = Math.max(1, Math.round(mins));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

// Date -> "3 Jul"
export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const round1 = (n) => Math.round(n * 10) / 10;
