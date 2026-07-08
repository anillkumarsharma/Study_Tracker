import { useState } from "react";
import { Plus, Trash2, Target, CalendarClock } from "lucide-react";
import { Page } from "../components/Layout";
import Modal from "../components/Modal";
import LiveCountdown from "../components/LiveCountdown";
import { useStudy } from "../store/StudyContext";
import { useAuth } from "../store/AuthContext";
import {
  countdownLabel,
  formatExamDate,
  daysUntil,
  todayISO,
} from "../utils/dates";

function WeeklyGoalCard() {
  const { user, updateGoal } = useAuth();
  const { refreshSummary } = useStudy();
  const [value, setValue] = useState(user.weeklyGoalHours || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateGoal(Number(value) || 0);
    await refreshSummary();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center gap-2 text-amber">
        <Target size={18} />
        <p className="font-semibold text-navy">Weekly hours goal</p>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Set a target for how many hours you want to study each week. Leave it at
        0 to use your routine's planned hours automatically.
      </p>
      <form onSubmit={save} className="mt-4 flex items-center gap-3">
        <input
          type="number"
          min="0"
          step="0.5"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-amber"
        />
        <span className="text-sm text-slate-500">hrs / week</span>
        <button
          type="submit"
          disabled={saving}
          className="ml-auto rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy hover:bg-amber/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save goal"}
        </button>
      </form>
    </div>
  );
}

function ExamModal({ open, onClose }) {
  const { subjects, addExam } = useStudy();
  const [form, setForm] = useState({ name: "", subjectId: "", date: "" });
  const today = todayISO();

  const submit = async (e) => {
    e.preventDefault();
    // Guard against past dates (typed in, or older browsers ignoring `min`).
    if (!form.name.trim() || !form.date || form.date < today) return;
    await addExam({
      name: form.name,
      subjectId: form.subjectId || null,
      date: form.date,
    });
    setForm({ name: "", subjectId: "", date: "" });
    onClose();
  };

  const field =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-amber";

  return (
    <Modal open={open} title="Add exam" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          autoFocus
          className={field}
          placeholder="Exam name (e.g. Physics Mid-term)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          className={field}
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
        >
          <option value="">No subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          min={today}
          className={field}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy hover:bg-amber/90"
          >
            Add exam
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ExamsCard() {
  const { exams, subjectById, deleteExam } = useStudy();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center gap-2 text-amber">
        <CalendarClock size={18} />
        <p className="font-semibold text-navy">Exam countdown</p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {exams.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            No exams added yet.
          </p>
        )}
        {exams.map((ex) => {
          const s = ex.subjectId ? subjectById[ex.subjectId] : null;
          const days = daysUntil(ex.date);
          const color = s?.color || "#E3A008";
          return (
            <div key={ex.id} className="group flex items-center gap-3">
              <span
                className="h-9 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">
                <p className="font-semibold text-navy">{ex.name}</p>
                <p className="text-xs text-slate-500">
                  {s ? `${s.name} · ` : ""}
                  {formatExamDate(ex.date)}
                </p>
                {days >= 0 && (
                  <p className="mt-1">
                    <LiveCountdown date={ex.date} color={color} />
                  </p>
                )}
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: days < 0 ? "#e2e8f0" : `${color}22`,
                  color: days < 0 ? "#94a3b8" : color,
                }}
              >
                {countdownLabel(ex.date)}
              </span>
              <button
                onClick={() => deleteExam(ex.id)}
                title="Delete"
                className="text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="mt-5 flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-navy/90"
      >
        <Plus size={16} />
        Add exam
      </button>

      <ExamModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function Goals() {
  return (
    <Page
      title="Goals & Exams"
      subtitle="Set a weekly target and keep an eye on upcoming exams."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:max-w-4xl">
        <WeeklyGoalCard />
        <ExamsCard />
      </div>
    </Page>
  );
}
