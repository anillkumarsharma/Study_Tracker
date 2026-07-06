import Exam from "../models/Exam.js";

const shape = (e) => ({
  id: e._id,
  name: e.name,
  subjectId: e.subject ? e.subject.toString() : null,
  date: e.date, // ISO; frontend computes days-left
});

// GET /api/exams — soonest first.
export const listExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ user: req.user._id }).sort({ date: 1 });
    res.json(exams.map(shape));
  } catch (err) {
    next(err);
  }
};

// POST /api/exams
export const createExam = async (req, res, next) => {
  try {
    const { name, subjectId, date } = req.body;
    if (!name || !date) {
      return res.status(400).json({ message: "name and date are required" });
    }
    const exam = await Exam.create({
      user: req.user._id,
      name: name.trim(),
      subject: subjectId || null,
      date: new Date(date),
    });
    res.status(201).json(shape(exam));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/exams/:id
export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
};
