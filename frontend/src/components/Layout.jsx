import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  Clock,
  BookOpen,
  Bell,
  Target,
  Flame,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { useStudy } from "../store/StudyContext";
import { useTimer, formatClock } from "../store/TimerContext";
import { useReminderScheduler } from "../hooks/useNotifications";
import Spinner from "./Spinner";

// Visible on every page: shows the live timer while a session runs.
function RunningTimerBadge() {
  const { running, elapsedSec, subjectId } = useTimer();
  const { subjectById } = useStudy();
  if (!running) return null;
  const s = subjectById[subjectId];
  return (
    <NavLink
      to="/time-log"
      className="mb-3 flex items-center gap-2 rounded-lg bg-amber/15 px-3 py-2 text-amber transition-colors hover:bg-amber/25"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-amber" />
      <div className="flex-1 leading-tight">
        <p className="font-mono text-sm font-bold">{formatClock(elapsedSec)}</p>
        <p className="truncate text-[11px] text-amber/80">
          {s?.name || "Session"} running
        </p>
      </div>
    </NavLink>
  );
}

const nav = [
  { to: "/", label: "Dashboard", icon: Activity, end: true },
  { to: "/routine", label: "Routine", icon: CalendarDays },
  { to: "/time-log", label: "Time Log", icon: Clock },
  { to: "/analytics", label: "Analytics", icon: BookOpen },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/govt-jobs", label: "Govt Jobs", icon: Briefcase },
  { to: "/reminders", label: "Reminders", icon: Bell },
];

function Sidebar() {
  const { summary } = useStudy();
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-white/5 bg-navy px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber text-navy">
          <BookOpen size={18} />
        </span>
        <span className="font-display text-xl font-bold text-paper">StudyLog</span>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber text-navy"
                  : "text-slate-300 hover:bg-white/5 hover:text-paper"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <RunningTimerBadge />
        <div className="flex items-center gap-2 px-2 text-sm text-amber">
          <Flame size={16} />
          <span>{summary.streak.current}-day streak</span>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle }) {
  const { user } = useAuth();
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-paper">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 rounded-full bg-white/5 py-1.5 pl-1.5 pr-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-amber text-sm font-bold text-navy">
          {user.initial}
        </span>
        <span className="text-sm font-medium text-paper">{user.name}</span>
      </div>
    </header>
  );
}

// Small helper so each page can set its own title/subtitle without prop drilling.
export function Page({ title, subtitle, children }) {
  return (
    <>
      <TopBar title={title} subtitle={subtitle} />
      <div className="mt-8">{children}</div>
    </>
  );
}

export default function Layout() {
  const { loading, subjects, reminders, subjectById } = useStudy();

  // Fire due reminders from any page while the app is open.
  useReminderScheduler(reminders, subjectById);

  // Show a loader only on the very first load (before any data arrives).
  const firstLoad = loading && subjects.length === 0;

  return (
    <div className="min-h-screen bg-navy">
      <Sidebar />
      <main className="ml-56 px-8 py-8">
        {firstLoad ? (
          <div className="text-paper">
            <Spinner label="Loading your study data…" />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
