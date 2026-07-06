import Routine from "../models/Routine.js";

// GET /api/routines — returns { subjectId: { Mon: 2, Tue: 1.5, ... } }
export const getRoutine = async (req, res, next) => {
  try {
    const entries = await Routine.find({ user: req.user._id });
    const grid = {};
    for (const e of entries) {
      const sid = e.subject.toString();
      if (!grid[sid]) grid[sid] = {};
      grid[sid][e.day] = e.hours;
    }
    res.json(grid);
  } catch (err) {
    next(err);
  }
};

// PUT /api/routines — upsert one cell. hours <= 0 (or null) clears it.
export const setCell = async (req, res, next) => {
  try {
    const { subjectId, day } = req.body;
    const hours = Number(req.body.hours);

    if (!subjectId || !day) {
      return res.status(400).json({ message: "subjectId and day are required" });
    }

    const filter = { user: req.user._id, subject: subjectId, day };

    if (!hours || hours <= 0) {
      await Routine.findOneAndDelete(filter);
      return res.json({ subjectId, day, hours: null });
    }

    await Routine.findOneAndUpdate(
      filter,
      { $set: { hours } },
      { upsert: true, new: true }
    );
    res.json({ subjectId, day, hours });
  } catch (err) {
    next(err);
  }
};
