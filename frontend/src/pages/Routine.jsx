import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Page } from "../components/Layout";
import Modal from "../components/Modal";
import { DAYS } from "../utils/dates";
import { formatDuration } from "../utils/format";
import { useStudy } from "../store/StudyContext";

// Read-only cell showing the actual time studied for this subject on this day.
// Auto-filled from logged sessions — you "edit" it by logging time, not typing.
function ActualCell({ color, hours }) {
  const mins = Math.round(hours * 60);
  return (
    <span
      className="inline-block min-w-[2.5rem] rounded-md px-2.5 py-1 text-xs font-semibold"
      style={
        mins > 0
          ? { backgroundColor: `${color}1f`, color }
          : { color: "#cbd5e1" }
      }
    >
      {mins > 0 ? formatDuration(mins) : "—"}
    </span>
  );
}

export default function Routine() {
  const { subjects, weeklyActuals, addSubject, deleteSubject } = useStudy();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    addSubject(name);
    setName("");
    setModalOpen(false);
  };

  return (
    <Page
      title="Your Weekly Routine"
      subtitle="Hours you've actually studied this week, per subject, per day. Fills in automatically as you log time."
    >
      <div className="rounded-2xl bg-paper p-6 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="pb-4 font-semibold">Subject</th>
              {DAYS.map((d) => (
                <th key={d} className="pb-4 text-center font-semibold">
                  {d}
                </th>
              ))}
              <th className="pb-4" />
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="group border-t border-slate-200/70">
                <td className="py-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium text-navy">{s.name}</span>
                  </div>
                </td>
                {DAYS.map((d) => (
                  <td key={d} className="py-4 text-center">
                    <ActualCell
                      color={s.color}
                      hours={weeklyActuals[s.id]?.[d] || 0}
                    />
                  </td>
                ))}
                <td className="py-4 text-right">
                  <button
                    onClick={() => deleteSubject(s.id)}
                    title="Remove subject"
                    className="text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={() => setModalOpen(true)}
          className="mt-6 flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-navy/90"
        >
          <Plus size={16} />
          Add subject
        </button>
      </div>

      <Modal
        open={modalOpen}
        title="Add subject"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit}>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Subject name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Computer Science"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-amber"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
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
    </Page>
  );
}
