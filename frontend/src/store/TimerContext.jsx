import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const TimerContext = createContext(null);
const KEY = "studylog_timer";

// Timestamp-based so it stays accurate even when the browser throttles timers
// in a background tab. Persisted so it survives navigation AND a full reload.
const EMPTY = {
  running: false,
  subjectId: "",
  topic: "",
  startedAt: null, // ms epoch when the current running segment began
  accumulatedMs: 0, // time banked from previous (paused) segments
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function TimerProvider({ children }) {
  const [state, setState] = useState(load);
  const [now, setNow] = useState(() => Date.now());

  // Persist every change.
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  // Re-render each second while running so the display ticks. The value itself
  // is derived from timestamps, so a throttled/late tick still shows the truth.
  useEffect(() => {
    if (!state.running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    // Recompute immediately when the tab becomes visible again.
    const onVisible = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [state.running]);

  const elapsedMs =
    state.accumulatedMs +
    (state.running && state.startedAt ? now - state.startedAt : 0);
  const elapsedSec = Math.floor(elapsedMs / 1000);

  const start = useCallback(
    () =>
      setState((s) =>
        s.running ? s : { ...s, running: true, startedAt: Date.now() }
      ),
    []
  );

  const pause = useCallback(
    () =>
      setState((s) =>
        !s.running
          ? s
          : {
              ...s,
              running: false,
              accumulatedMs: s.accumulatedMs + (Date.now() - s.startedAt),
              startedAt: null,
            }
      ),
    []
  );

  // Clear the clock but keep the selected subject for the next session.
  const reset = useCallback(
    () =>
      setState((s) => ({
        ...EMPTY,
        subjectId: s.subjectId,
      })),
    []
  );

  const setSubject = useCallback(
    (subjectId) => setState((s) => ({ ...s, subjectId })),
    []
  );
  const setTopic = useCallback((topic) => setState((s) => ({ ...s, topic })), []);

  const value = {
    running: state.running,
    subjectId: state.subjectId,
    topic: state.topic,
    elapsedMs,
    elapsedSec,
    start,
    pause,
    reset,
    setSubject,
    setTopic,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within <TimerProvider>");
  return ctx;
}

// Shared hh:mm:ss formatter.
export function formatClock(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
