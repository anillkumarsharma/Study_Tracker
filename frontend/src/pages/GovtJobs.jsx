import { useMemo, useState } from "react";
import {
  Search,
  Building2,
  Users,
  GraduationCap,
  CalendarClock,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { Page } from "../components/Layout";
import { GOVT_JOBS, JOB_CATEGORIES } from "../data/govtJobs";
import { daysUntil, formatExamDate, countdownLabel } from "../utils/dates";

// Har job ki current position: exam abhi baaki hai, ho gayi, ya announce nahi hui.
function examStatus(examDate) {
  if (!examDate) return { key: "tba", label: "Exam date TBA" };
  const d = daysUntil(examDate);
  if (d < 0) return { key: "over", label: "Exam done" };
  return { key: "upcoming", label: countdownLabel(examDate) };
}

// Aavedan window abhi khula hai ya nahi (aaj ki tarikh ke hisaab se).
function applyStatus(applyStart, applyEnd) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = applyStart ? new Date(applyStart) : null;
  const end = applyEnd ? new Date(applyEnd) : null;
  if (start && today < start) return { key: "soon", label: "Apply opens soon" };
  if (end && today > end) return { key: "closed", label: "Apply closed" };
  return { key: "open", label: "Apply open now" };
}

const STATUS_STYLE = {
  upcoming: "bg-amber/15 text-amber",
  tba: "bg-slate-100 text-slate-500",
  over: "bg-slate-100 text-slate-400",
};

const APPLY_STYLE = {
  open: "bg-green-100 text-green-700",
  soon: "bg-blue-100 text-blue-700",
  closed: "bg-red-100 text-red-600",
};

function JobCard({ job }) {
  const exam = examStatus(job.examDate);
  const apply = applyStatus(job.applyStart, job.applyEnd);

  return (
    <div className="flex flex-col rounded-2xl bg-paper p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber">
          <Building2 size={14} />
          <span>{job.department}</span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLE[exam.key]
          }`}
        >
          {exam.label}
        </span>
      </div>

      <h3 className="mt-2 font-display text-lg font-bold leading-snug text-navy">
        {job.post}
      </h3>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Users size={14} className="text-slate-400" />
          {job.vacancies ? `${job.vacancies.toLocaleString("en-IN")} posts` : "Posts TBA"}
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap size={14} className="text-slate-400" />
          {job.qualification}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy/5 px-3 py-2 text-sm text-navy">
        <CalendarClock size={15} className="text-amber" />
        <span className="font-medium">
          {job.examDate ? `Exam: ${formatExamDate(job.examDate)}` : "Exam date not announced"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            APPLY_STYLE[apply.key]
          }`}
        >
          {apply.label}
        </span>
        <a
          href={job.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-amber"
        >
          Notification
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

export default function GovtJobs() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GOVT_JOBS
      .filter((j) => category === "All" || j.category === category)
      .filter(
        (j) =>
          !q ||
          j.post.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q)
      )
      // Upcoming exams pehle (soonest first); TBA/past sabse aakhir mein.
      .sort((a, b) => {
        const av = a.examDate ? daysUntil(a.examDate) : Infinity;
        const bv = b.examDate ? daysUntil(b.examDate) : Infinity;
        const norm = (x) => (x < 0 ? Infinity - 1 : x); // past ko peeche
        return norm(av) - norm(bv);
      });
  }, [query, category]);

  const upcomingCount = GOVT_JOBS.filter(
    (j) => j.examDate && daysUntil(j.examDate) >= 0
  ).length;

  const chip = (label, active, onClick) => (
    <button
      key={label}
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-amber text-navy"
          : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-paper"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Page
      title="Rajasthan Govt Jobs"
      subtitle={`${upcomingCount} upcoming exams · saari sarkari bharti ek jagah`}
    >
      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Post ya department search karo…"
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-paper placeholder:text-slate-400 outline-none focus:border-amber"
        />
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {chip("All", category === "All", () => setCategory("All"))}
        {JOB_CATEGORIES.map((c) =>
          chip(c, category === c, () => setCategory(c))
        )}
      </div>

      {/* Job grid */}
      {jobs.length === 0 ? (
        <div className="rounded-2xl bg-paper p-10 text-center">
          <Briefcase size={28} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            Is filter mein koi vacancy nahi mili.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-slate-500">
        ⚠️ Dates suchna ke liye hain. Aavedan se pehle official notification zaroor
        check karein. Latest update ke liye RPSC / RSMSSB ki official website dekhein.
      </p>
    </Page>
  );
}
