import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { todayISO } from "../utils/dates";
import { QUOTES } from "../data/quotes";

const SHOWN_KEY = "studylog_quote_shown"; // stores the last date we showed it

// Time-of-day greeting so the popup feels alive.
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Suprabhat";
  if (h < 17) return "Namaste";
  return "Shubh Sandhya";
}

// Pick a random quote each time the popup opens, so it feels fresh every day.
function pickQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

// Shows a motivational quote from "Anil bhaiya" once per day, on the first
// app open of the day, personalised with the logged-in user's name.
export default function DailyQuote() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(SHOWN_KEY) !== todayISO()) {
      setQuote(pickQuote()); // choose once when the popup opens
      setOpen(true);
    }
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(SHOWN_KEY, todayISO());
    setOpen(false);
  };

  if (!open || !user) return null;

  const name = user.firstName || user.name || "dost";
  const text = quote.replaceAll("{name}", name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-paper p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-navy"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-amber">
          <Sparkles size={18} />
          <p className="text-xs font-semibold uppercase tracking-wide">
            {greeting()}, {name} 👋
          </p>
        </div>

        <p className="mt-5 font-display text-xl font-semibold leading-relaxed text-navy">
          “{text}”
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-bold text-paper">
              A
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-navy">Anil bhaiya</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-amber/90"
          >
            Chalo shuru karein!
          </button>
        </div>
      </div>
    </div>
  );
}
