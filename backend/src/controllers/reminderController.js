import Reminder from "../models/Reminder.js";

const shape = (r) => ({
  id: r._id,
  subjectId: r.subject.toString(),
  time: r.time,
  enabled: r.enabled,
});

// GET /api/reminders
export const listReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({
      createdAt: 1,
    });
    res.json(reminders.map(shape));
  } catch (err) {
    next(err);
  }
};

// POST /api/reminders
export const createReminder = async (req, res, next) => {
  try {
    const { subjectId, time } = req.body;
    if (!subjectId || !time) {
      return res.status(400).json({ message: "subjectId and time are required" });
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      subject: subjectId,
      time,
      enabled: true,
    });
    res.status(201).json(shape(reminder));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/reminders/:id/toggle
export const toggleReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    reminder.enabled = !reminder.enabled;
    await reminder.save();
    res.json(shape(reminder));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reminders/:id
export const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });
    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
};
