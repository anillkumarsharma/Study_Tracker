import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { Page } from "../components/Layout";
import { useStudy } from "../store/StudyContext";
import { startOfWeek, formatDayMonth } from "../utils/dates";
import { formatDuration } from "../utils/format";

const WEEK_MS = 7 * 86400000;

// Fallback used when a session points at a subject that was later deleted, so
// its time still counts toward the week total instead of vanishing.
const DELETED_SUBJECT = { name: "Deleted subject", color: "#94a3b8" };

// One row per subject inside a week card: colour dot + name + time on top,
// a proportion bar with its percentage below. Compact so it fits narrow cards.
function SubjectRow({ subject, mins, weekTotal }) {
  const pct = weekTotal > 0 ? Math.round((mins / weekTotal) * 100) : 0;
  return (
    <div className="py-2">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
        <span className="flex-1 truncate text-sm font-medium text-navy">
          {subject.name}
        </span>
        <span className="shrink-0 text-sm font-semibold text-navy">
          {formatDuration(mins)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 pl-[18px]">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: subject.color }}
          />
        </div>
        <span className="w-8 shrink-0 text-right text-[11px] text-slate-400">
          {pct}%
        </span>
      </div>
    </div>
  );
}

function WeekCard({ week, subjectById, isCurrent }) {
  const weekEnd = new Date(week.start.getTime() + 6 * 86400000);

  // Subjects sorted by time spent, most first.
  const rows = Object.entries(week.bySubject)
    .map(([subjectId, mins]) => ({
      subject: subjectById[subjectId] || DELETED_SUBJECT,
      mins,
    }))
    .sort((a, b) => b.mins - a.mins);

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-navy">Week {week.number}</h3>
          {isCurrent && (
            <span className="rounded-full bg-amber/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber">
              This week
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500">
          {formatDayMonth(week.start)} – {formatDayMonth(weekEnd)}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-b border-slate-200/70 pb-4">
        <div>
          <p className="text-xl font-bold text-navy">
            {formatDuration(week.totalMins)}
          </p>
          <p className="text-[11px] text-slate-500">total</p>
        </div>
        <div>
          <p className="text-xl font-bold text-navy">{week.count}</p>
          <p className="text-[11px] text-slate-500">
            {week.count === 1 ? "session" : "sessions"}
          </p>
        </div>
        <div>
          <p className="text-xl font-bold text-navy">{rows.length}</p>
          <p className="text-[11px] text-slate-500">
            {rows.length === 1 ? "subject" : "subjects"}
          </p>
        </div>
      </div>

      <div className="mt-2 divide-y divide-slate-200/50">
        {rows.map((r) => (
          <SubjectRow
            key={r.subject.name}
            subject={r.subject}
            mins={r.mins}
            weekTotal={week.totalMins}
          />
        ))}
      </div>
    </div>
  );
}

export default function Weeks() {
  const { sessions, subjectById } = useStudy();

  // Group every session into the Monday-based calendar week it belongs to.
  const weeks = useMemo(() => {
    const map = new Map(); // weekStart(ms) -> { start, totalMins, bySubject, count }
    for (const s of sessions) {
      const ws = startOfWeek(new Date(s.dateISO));
      const key = ws.getTime();
      let w = map.get(key);
      if (!w) {
        w = { start: ws, totalMins: 0, bySubject: {}, count: 0 };
        map.set(key, w);
      }
      w.totalMins += s.durationMins;
      w.bySubject[s.subjectId] =
        (w.bySubject[s.subjectId] || 0) + s.durationMins;
      w.count += 1;
    }

    const arr = [...map.values()].sort((a, b) => a.start - b.start);
    if (!arr.length) return arr;

    // Number weeks by their calendar distance from the first week that has
    // data, so a skipped week doesn't renumber the ones after it.
    const firstStart = arr[0].start.getTime();
    return arr.map((w) => ({
      ...w,
      number: Math.round((w.start.getTime() - firstStart) / WEEK_MS) + 1,
    }));
  }, [sessions]);

  const currentWeekKey = startOfWeek(new Date()).getTime();

  return (
    <Page
      title="Weekly Report"
      subtitle="Every week since you started, broken down by total time and subject."
    >
      {weeks.length === 0 ? (
        <div className="rounded-2xl bg-paper p-10 text-center shadow-sm">
          <CalendarClock className="mx-auto mb-3 text-slate-300" size={32} />
          <p className="text-sm text-slate-400">
            No study logged yet. Log a session in Time Log and your weeks will
            appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {weeks.map((week) => (
            <WeekCard
              key={week.start.getTime()}
              week={week}
              subjectById={subjectById}
              isCurrent={week.start.getTime() === currentWeekKey}
            />
          ))}
        </div>
      )}
    </Page>
  );
}
