import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { generateToken } from "../utils/token.js";

// New users start with the same 5 subjects the UI shipped with.
const DEFAULT_SUBJECTS = [
  { name: "Mathematics", color: "#4C6EF5" },
  { name: "Physics", color: "#22A565" },
  { name: "Chemistry", color: "#E3A008" },
  { name: "English", color: "#EC4899" },
  { name: "Biology", color: "#06B6D4" },
];

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  username: u.username,
  firstName: u.name.split(" ")[0],
  initial: u.name[0].toUpperCase(),
  weeklyGoalHours: u.weeklyGoalHours || 0,
});

// POST /api/auth/login  — passwordless "find or create".
// New username -> account is created; existing username -> logged straight in.
export const login = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    const username = (req.body.username || "").trim().toLowerCase();

    if (!/^[a-z0-9]{6}$/.test(username)) {
      return res
        .status(400)
        .json({ message: "Username must be exactly 6 letters or digits" });
    }

    let user = await User.findOne({ username });

    if (!user) {
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      user = await User.create({ name, username });
      await Subject.insertMany(
        DEFAULT_SUBJECTS.map((s) => ({ ...s, user: user._id }))
      );
    }

    res.json({ token: generateToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register — strict create (409 if username taken).
export const register = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    const username = (req.body.username || "").trim().toLowerCase();

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!/^[a-z0-9]{6}$/.test(username)) {
      return res
        .status(400)
        .json({ message: "Username must be exactly 6 letters or digits" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ message: "That username is already taken" });
    }

    const user = await User.create({ name, username });
    await Subject.insertMany(
      DEFAULT_SUBJECTS.map((s) => ({ ...s, user: user._id }))
    );

    res
      .status(201)
      .json({ token: generateToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me — current user from token.
export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

// PATCH /api/auth/goal — set the weekly hours goal (0 = auto from routine).
export const updateGoal = async (req, res, next) => {
  try {
    const hours = Number(req.body.weeklyGoalHours);
    if (!Number.isFinite(hours) || hours < 0) {
      return res.status(400).json({ message: "weeklyGoalHours must be >= 0" });
    }
    req.user.weeklyGoalHours = hours;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
};
