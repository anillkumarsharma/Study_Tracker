import { useEffect, useState } from "react";
import { countdownParts } from "../utils/dates";

const pad = (n) => String(n).padStart(2, "0");

// A ticking countdown to an exam, refreshed every second.
export default function LiveCountdown({ date, color }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { over, days, hours, mins, secs } = countdownParts(date, now);

  if (over) {
    return (
      <span className="text-xs font-medium text-slate-400">Exam day passed</span>
    );
  }

  return (
    <span
      className="font-mono text-xs font-semibold tabular-nums"
      style={{ color }}
    >
      {days > 0 && `${days}d `}
      {pad(hours)}h {pad(mins)}m {pad(secs)}s
    </span>
  );
}
