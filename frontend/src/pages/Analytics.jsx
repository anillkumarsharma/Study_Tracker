import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Flame } from "lucide-react";
import { Page } from "../components/Layout";
import { useStudy } from "../store/StudyContext";

function Card({ title, children }) {
  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { summary } = useStudy();
  const { weeklyStats, subjectDistribution, streak } = summary;

  const pieData = subjectDistribution.filter((d) => d.hours > 0);

  return (
    <Page
      title="Performance Analytics"
      subtitle="Planned vs actual, subject-wise breakdown."
    >
      <div className="flex max-w-4xl flex-col gap-6">
        <Card title="Weekly Trend">
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyStats}
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#cbd5e1", fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="planned"
                  name="Planned"
                  stroke="#C9C2B4"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#C9C2B4" }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual"
                  stroke="#E3A008"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#E3A008" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#C9C2B4]" /> Planned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber" /> Actual
            </span>
          </div>
        </Card>

        <Card title="Subject-wise Distribution">
          {pieData.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">
              Log some sessions to see your subject breakdown.
            </p>
          ) : (
            <>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="hours"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {pieData.map((d) => (
                        <Cell key={d.subjectId} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
                {pieData.map((d) => (
                  <span key={d.subjectId} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    {d.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card title="Consistency">
          <div className="mt-4 flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-amber/15 text-amber">
              <Flame size={22} />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-navy">
                {streak.current}-day streak
              </p>
              <p className="text-sm text-slate-500">
                Total hours logged: {streak.totalHours}h
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
