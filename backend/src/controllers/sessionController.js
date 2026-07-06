import Session from "../models/Session.js";
import { formatDuration, formatDate } from "../utils/format.js";

const shape = (s) => ({
  id: s._id,
  subjectId: s.subject.toString(),
  topic: s.topic,
  durationMins: s.durationMins,
  duration: formatDuration(s.durationMins),
  note: s.note,
  date: formatDate(s.date),
});

// GET /api/sessions — newest first.
export const listSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(sessions.map(shape));
  } catch (err) {
    next(err);
  }
};

// POST /api/sessions
export const createSession = async (req, res, next) => {
  try {
    const { subjectId, topic, durationMins, note, date } = req.body;

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required" });
    }
    if (!durationMins || durationMins < 1) {
      return res.status(400).json({ message: "durationMins must be at least 1" });
    }

    const session = await Session.create({
      user: req.user._id,
      subject: subjectId,
      topic,
      durationMins,
      note,
      date: date ? new Date(date) : Date.now(),
    });
    res.status(201).json(shape(session));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sessions/:id
export const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
};
