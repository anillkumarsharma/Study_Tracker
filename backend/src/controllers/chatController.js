import Subject from "../models/Subject.js";
import Exam from "../models/Exam.js";
import Session from "../models/Session.js";
import ChatMessage from "../models/ChatMessage.js";
import { formatDuration } from "../utils/format.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

// Builds a short summary of the user's study data so the assistant can talk
// meaningfully about their routine, subjects, exams and logged hours.
async function buildStudyContext(user) {
  const [subjects, exams, sessions] = await Promise.all([
    Subject.find({ user: user._id }),
    Exam.find({ user: user._id }).sort({ date: 1 }),
    Session.find({ user: user._id }).sort({ date: -1 }).limit(60),
  ]);

  // Hours logged this week, per subject.
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((now.getDay() + 6) % 7)); // back to Monday

  const nameById = Object.fromEntries(
    subjects.map((s) => [s._id.toString(), s.name])
  );
  const weekMins = {};
  let weekTotal = 0;
  for (const s of sessions) {
    if (new Date(s.date) < weekStart) continue;
    const key = s.subject.toString();
    weekMins[key] = (weekMins[key] || 0) + s.durationMins;
    weekTotal += s.durationMins;
  }

  const subjectLine = subjects.length
    ? subjects.map((s) => s.name).join(", ")
    : "koi subject nahi";

  const weekLine = Object.keys(weekMins).length
    ? Object.entries(weekMins)
        .map(([id, m]) => `${nameById[id] || "?"}: ${formatDuration(m)}`)
        .join(", ")
    : "is hafte abhi tak kuch log nahi kiya";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examLine = exams.filter((e) => new Date(e.date) >= today).length
    ? exams
        .filter((e) => new Date(e.date) >= today)
        .slice(0, 5)
        .map((e) => {
          const days = Math.round((new Date(e.date) - today) / 86400000);
          return `${e.name} (${days} din baad)`;
        })
        .join(", ")
    : "koi aane wala exam nahi";

  return [
    `Student ka naam: ${user.name}.`,
    `Subjects: ${subjectLine}.`,
    `Weekly goal: ${user.weeklyGoalHours || 0} ghante.`,
    `Is hafte study: ${weekLine} (total ${formatDuration(
      Math.max(1, weekTotal)
    )}).`,
    `Upcoming exams: ${examLine}.`,
  ].join("\n");
}

// POST /api/chat — { messages: [{ role: "user"|"assistant", content }] }
export const chat = async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message:
          "AI abhi set nahi hai. Backend .env me GEMINI_API_KEY add karein.",
      });
    }

    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    if (!messages.length) {
      return res.status(400).json({ message: "messages is required" });
    }

    const context = await buildStudyContext(req.user);

    const systemPrompt = `Tum "StudyBuddy" ho — StudyLog app ka ek friendly, motivating study coach.
Tum student se Hinglish (Hindi + English mix) me baat karte ho, chhote aur clear jawab dete ho.
Sirf padhai, daily routine, time management, motivation aur exams ke baare me help karo.
Neeche student ka real data hai — isko use karke personal aur specific salah do.
Agar koi cheez data me nahi hai to poochh lo, guess mat karo.

--- Student ka data ---
${context}
-----------------------`;

    // Gemini uses "model" for the assistant role.
    const contents = messages
      .filter((m) => m && m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content).slice(0, 4000) }],
      }));

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    };

    const response = await fetch(GEMINI_URL(GEMINI_MODEL, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", JSON.stringify(data));
      const msg = data?.error?.message || "AI se jawab nahi mila.";
      return res.status(502).json({ message: msg });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Sorry, main abhi jawab nahi de paaya. Dobara try karo.";

    // Persist the latest user turn and the assistant's reply so the
    // conversation survives refresh / re-login.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const toSave = [];
    if (lastUser?.content) {
      toSave.push({
        user: req.user._id,
        role: "user",
        content: String(lastUser.content).slice(0, 4000),
      });
    }
    toSave.push({ user: req.user._id, role: "assistant", content: reply });
    // Don't fail the request if persistence hiccups — the user still gets a reply.
    ChatMessage.insertMany(toSave).catch((e) =>
      console.error("Failed to save chat:", e.message)
    );

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/history — full saved conversation, oldest first.
export const getHistory = async (req, res, next) => {
  try {
    const history = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .select("role content createdAt")
      .lean();
    res.json({ history });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/chat/history — wipe this user's saved conversation.
export const clearHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ message: "Chat history clear ho gayi." });
  } catch (err) {
    next(err);
  }
};
