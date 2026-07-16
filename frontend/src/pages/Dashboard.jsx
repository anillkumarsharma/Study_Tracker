import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
} from "recharts";
import { CalendarClock } from "lucide-react";
import { Page } from "../components/Layout";
import LiveCountdown from "../components/LiveCountdown";
import { useStudy } from "../store/StudyContext";
import { useAuth } from "../store/AuthContext";
import { countdownLabel, daysUntil, DAYS } from "../utils/dates";

function GoalRing({ percent }) {
  const data = [{ value: percent }, { value: Math.max(0, 100 - percent) }];
  return (
    <div className="relative h-32 w-32 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={46}
            outerRadius={62}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill="#E3A008" />
            <Cell fill="#E7E1D4" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-navy">
          {percent}%
        </span>
        <span className="text-xs text-slate-500">of goal</span>
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-paper p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { subjects, subjectById, routine, summary, exams } = useStudy();
  const { user } = useAuth();

  // Next 3 exams that haven't passed yet.
  const upcomingExams = exams
    .filter((e) => daysUntil(e.date) >= 0)
    .slice(0, 3);

  const { weeklyGoal, weeklyStats } = summary;
  const remaining = Math.round((weeklyGoal.target - weeklyGoal.done) * 10) / 10;
  const note =
    weeklyGoal.target === 0
      ? "Set your weekly routine to track a goal."
      : weeklyGoal.done >= weeklyGoal.target
      ? "Goal reached — great work! 🎉"
      : `${remaining} hrs left to hit your weekly goal.`;

  // Today's plan = subjects that have routine hours scheduled for today.
  const todayLabel = DAYS[(new Date().getDay() + 6) % 7];
  const todaysPlan = subjects
    .filter((s) => routine[s.id]?.[todayLabel])
    .map((s) => ({ subjectId: s.id, planned: `${routine[s.id][todayLabel]}h` }));

  return (
    <Page
      title={`Namaste, ${user.firstName} 👋`}
      subtitle="Here's how your week is shaping up."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly goal */}
        <Card className="flex items-center gap-5">
          <GoalRing percent={weeklyGoal.percent} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Weekly Goal
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-navy">
              {weeklyGoal.done} / {weeklyGoal.target} hrs
            </p>
            <p className="mt-2 text-sm text-slate-500">{note}</p>
          </div>
        </Card>

        {/* Planned vs actual */}
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Planned vs Actual (this week)
          </p>
          <div className="mt-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats} barGap={2} barCategoryGap="20%">
                <Bar dataKey="planned" fill="#D9D2C4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="actual" fill="#E3A008" radius={[3, 3, 0, 0]} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Today's plan */}
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Today's Plan
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {todaysPlan.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                Nothing planned for today.
              </p>
            )}
            {todaysPlan.map((item) => {
              const s = subjectById[item.subjectId];
              if (!s) return null;
              return (
                <div key={item.subjectId} className="flex items-center gap-3">
                  <span
                    className="h-9 w-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-navy">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      Planned {item.planned}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: `${s.color}22`, color: s.color }}
                  >
                    Planned
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Upcoming exams */}
      {upcomingExams.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center gap-2 text-amber">
            <CalendarClock size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming Exams
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {upcomingExams.map((ex) => {
              const s = ex.subjectId ? subjectById[ex.subjectId] : null;
              const color = s?.color || "#E3A008";
              return (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 rounded-xl bg-white/60 p-3"
                >
                  <span
                    className="h-9 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-navy">{ex.name}</p>
                    <p className="text-xs font-medium" style={{ color }}>
                      {countdownLabel(ex.date)}
                    </p>
                    <p className="mt-0.5">
                      <LiveCountdown date={ex.date} color={color} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </Page>
  );
}
