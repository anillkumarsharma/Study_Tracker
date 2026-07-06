import { useEffect, useState } from "react";

const supported = typeof window !== "undefined" && "Notification" in window;

// Fire a browser notification (+ a short vibration on phones that support it).
export function showNotification(title, body) {
  if (!supported || Notification.permission !== "granted") return false;
  new Notification(title, { body, icon: "/favicon.ico" });
  if (navigator.vibrate) navigator.vibrate(200);
  return true;
}

// Permission state + helpers for the Reminders UI.
export function useNotificationPermission() {
  const [status, setStatus] = useState(
    supported ? Notification.permission : "unsupported"
  );

  const request = async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setStatus(result);
    return result;
  };

  const sendTest = async () => {
    if (!supported) return;
    let perm = Notification.permission;
    if (perm !== "granted") perm = await request();
    if (perm === "granted") {
      showNotification("StudyLog test 🔔", "Notifications are working. Time to study!");
    }
  };

  return { status, supported, request, sendTest };
}

// While the app is open, checks every 20s and fires each enabled reminder once
// per day when its HH:MM matches the current time.
export function useReminderScheduler(reminders, subjectById) {
  useEffect(() => {
    if (!supported) return;

    const tick = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const cur = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const dayKey = now.toDateString();

      for (const r of reminders) {
        if (!r.enabled || r.time !== cur) continue;
        const firedKey = `studylog_fired_${r.id}_${dayKey}`;
        if (localStorage.getItem(firedKey)) continue;
        localStorage.setItem(firedKey, "1");
        const s = subjectById[r.subjectId];
        showNotification(
          "StudyLog reminder 📚",
          `Time to study ${s?.name || "your subject"}.`
        );
      }
    };

    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, [reminders, subjectById]);
}
