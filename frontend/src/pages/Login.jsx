import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "../store/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const err = await login(name, username);
    setError(err); // null on success -> App swaps to the dashboard
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber text-navy">
            <BookOpen size={20} />
          </span>
          <span className="font-display text-2xl font-bold text-navy">
            StudyLog
          </span>
        </div>

        <h1 className="font-display text-xl font-bold text-navy">
          Welcome 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your name and pick a 6-character username to get started.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Username (6 characters)
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 6))}
              placeholder="e.g. aarav1"
              maxLength={6}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono tracking-wider text-navy outline-none placeholder:text-slate-400 focus:border-amber"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {username.length}/6 · letters and digits only
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-amber py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
