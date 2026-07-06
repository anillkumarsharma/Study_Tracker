import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Page } from "../components/Layout";
import Modal from "../components/Modal";
import { useStudy } from "../store/StudyContext";
import { useNotificationPermission } from "../hooks/useNotifications";

const STATUS_TEXT = {
  granted: "enabled",
  denied: "blocked",
  default: "not set",
  unsupported: "unsupported in this browser",
};

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-amber" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function AddReminderModal({ open, onClose }) {
  const { subjects, addReminder } = useStudy();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [time, setTime] = useState("18:00");

  const submit = (e) => {
    e.preventDefault();
    addReminder({ subjectId: subjectId || subjects[0]?.id, time });
    onClose();
  };

  const field =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-amber";

  return (
    <Modal open={open} title="Add reminder" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className={field}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={field}
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
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Reminders() {
  const { reminders, subjectById, toggleReminder, deleteReminder } = useStudy();
  const { status, supported, request, sendTest } = useNotificationPermission();
  const [open, setOpen] = useState(false);

  return (
    <Page title="Reminders" subtitle="Get nudged when it's time to study.">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:max-w-4xl">
        {/* Notification permission */}
        <div className="rounded-2xl bg-paper p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber">
            <Bell size={18} />
            <p className="font-semibold text-navy">Notification permission</p>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Status: <span className="font-semibold">{STATUS_TEXT[status]}</span>.
            Allow notifications so reminders can reach you while StudyLog is
            open.
          </p>
          <button
            onClick={request}
            disabled={!supported || status === "granted"}
            className="mt-4 w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "granted" ? "Notifications enabled ✓" : "Enable notifications"}
          </button>
          <button
            onClick={sendTest}
            disabled={!supported}
            className="mt-3 w-full rounded-lg bg-amber py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send test reminder now
          </button>
          <p className="mt-4 text-xs text-slate-400">
            On a phone, this also triggers a short vibration if the browser
            supports it. Scheduled reminders fire while this tab is open.
          </p>
        </div>

        {/* Subject reminders */}
        <div className="rounded-2xl bg-paper p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Subject Reminders
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {reminders.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                No reminders yet.
              </p>
            )}
            {reminders.map((r) => {
              const s = subjectById[r.subjectId];
              if (!s) return null;
              return (
                <div key={r.id} className="group flex items-center gap-3">
                  <span
                    className="h-9 w-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-navy">{s.name}</p>
                    <p className="text-xs text-slate-500">Daily at {r.time}</p>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    title="Delete"
                    className="text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Toggle on={r.enabled} onClick={() => toggleReminder(r.id)} />
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setOpen(true)}
            className="mt-5 flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-navy/90"
          >
            <Plus size={16} />
            Add reminder
          </button>
        </div>
      </div>

      <AddReminderModal open={open} onClose={() => setOpen(false)} />
    </Page>
  );
}
