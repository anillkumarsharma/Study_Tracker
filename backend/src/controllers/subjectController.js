import Subject from "../models/Subject.js";
import Routine from "../models/Routine.js";
import Session from "../models/Session.js";
import Reminder from "../models/Reminder.js";
import Exam from "../models/Exam.js";

const shape = (s) => ({ id: s._id, name: s.name, color: s.color });

// GET /api/subjects
export const listSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({
      createdAt: 1,
    });
    res.json(subjects.map(shape));
  } catch (err) {
    next(err);
  }
};

// POST /api/subjects
export const createSubject = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Name is required" });

    const subject = await Subject.create({
      user: req.user._id,
      name,
      color: req.body.color || "#4C6EF5",
    });
    res.status(201).json(shape(subject));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/subjects/:id  — also clears its routine/sessions/reminders.
export const deleteSubject = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, user: req.user._id };
    const subject = await Subject.findOneAndDelete(filter);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const cascade = { subject: req.params.id, user: req.user._id };
    await Promise.all([
      Routine.deleteMany(cascade),
      Session.deleteMany(cascade),
      Reminder.deleteMany(cascade),
      Exam.updateMany(cascade, { $set: { subject: null } }),
    ]);

    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
};
