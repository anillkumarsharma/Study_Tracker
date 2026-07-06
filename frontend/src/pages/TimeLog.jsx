import { useEffect, useRef, useState } from "react";
import { Play, Pause, Plus, Trash2 } from "lucide-react";
import { Page } from "../components/Layout";
import Modal from "../components/Modal";
import { useStudy } from "../store/StudyContext";

function pad(n) {
  return String(n).padStart(2, "0");
}

function LiveSession() {
  const { subjects, addSession } = useStudy();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;

  const save = async () => {
    if (seconds < 1) return;
    await addSession({
      subjectId,
      topic,
      durationMins: Math.max(1, Math.round(seconds / 60)),
    });
    setRunning(false);
    setSeconds(0);
    setTopic("");
  };

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Live Session
      </p>

      <select
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-amber"
      >
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic (e.g. Thermodynamics)"
        className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-amber"
      />

      <div className="my-6 text-center font-mono text-4xl font-bold tracking-widest text-navy">
        {pad(h)}:{pad(m)}:{pad(sec)}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-amber/90"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={save}
          disabled={seconds < 1}
          className="flex-1 rounded-lg bg-navy py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save log
        </button>
      </div>
    </div>
  );
}

function ManualModal({ open, onClose }) {
  const { subjects, addSession } = useStudy();
  const [form, setForm] = useState({ subjectId: "", topic: "", h: "", m: "" });

  const submit = async (e) => {
    e.preventDefault();
    const hours = parseInt(form.h || "0", 10);
    const mins = parseInt(form.m || "0", 10);
    const total = hours * 60 + mins;
    if (total < 1) return;
    await addSession({
      subjectId: form.subjectId || subjects[0]?.id,
      topic: form.topic,
      durationMins: total,
    });
    setForm({ subjectId: "", topic: "", h: "", m: "" });
    onClose();
  };

  const field =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-amber";

  return (
    <Modal open={open} title="Add session manually" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <select
          value={form.subjectId || subjects[0]?.id}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          className={field}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          className={field}
          placeholder="Topic"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />
        <div className="flex gap-3">
          <input
            className={field}
            type="number"
            min="0"
            placeholder="Hours"
            value={form.h}
            onChange={(e) => setForm({ ...form, h: e.target.value })}
          />
          <input
            className={field}
            type="number"
            min="0"
            max="59"
            placeholder="Minutes"
            value={form.m}
            onChange={(e) => setForm({ ...form, m: e.target.value })}
          />
        </div>
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
            Add session
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RecentSessions() {
  const { sessions, subjectById, deleteSession } = useStudy();
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recent Sessions
        </p>
        <button
          onClick={() => setManualOpen(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-navy transition-colors hover:bg-slate-200"
        >
          <Plus size={14} />
          Add manually
        </button>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-slate-200/70">
        {sessions.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            No sessions yet. Start the timer or add one manually.
          </p>
        )}
        {sessions.map((sess) => {
          const s = subjectById[sess.subjectId];
          if (!s) return null;
          return (
            <div
              key={sess.id}
              className="group flex gap-3 py-4 first:pt-0 last:pb-0"
            >
              <span
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-navy">{sess.topic}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="text-sm font-medium text-slate-500">
                      {sess.duration}
                    </p>
                    <button
                      onClick={() => deleteSession(sess.id)}
                      title="Delete"
                      className="text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {s.name} · {sess.date}
                </p>
                {sess.note && (
                  <p className="mt-1 text-xs italic text-slate-400">
                    {sess.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  );
}

export default function TimeLog() {
  return (
    <Page title="Time Log" subtitle="Track live sessions or add them manually.">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:max-w-4xl">
        <LiveSession />
        <RecentSessions />
      </div>
    </Page>
  );
}
