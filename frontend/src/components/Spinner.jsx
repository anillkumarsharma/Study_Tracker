import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <Loader2 className="animate-spin text-amber" size={28} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
