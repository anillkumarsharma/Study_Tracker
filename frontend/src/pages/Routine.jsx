import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Page } from "../components/Layout";
import Modal from "../components/Modal";
import { DAYS } from "../data/dummy";
import { useStudy } from "../store/StudyContext";

function EditableCell({ color, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  const commit = () => {
    const num = parseFloat(draft);
    onSave(Number.isFinite(num) ? num : null);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        step="0.5"
        min="0"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-14 rounded-md border border-amber bg-white px-1.5 py-1 text-center text-xs font-semibold text-navy outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value ?? "");
        setEditing(true);
      }}
      className="min-w-[2.5rem] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors"
      style={
        value
          ? { backgroundColor: `${color}1f`, color }
          : { color: "#cbd5e1" }
      }
    >
      {value ? `${value}h` : "—"}
    </button>
  );
}

export default function Routine() {
  const { subjects, routine, setRoutineCell, addSubject, deleteSubject } =
    useStudy();
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
      subtitle="Set your planned study hours per subject, per day. Click any cell to edit."
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
                    <EditableCell
                      color={s.color}
                      value={routine[s.id]?.[d]}
                      onSave={(hrs) => setRoutineCell(s.id, d, hrs)}
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
