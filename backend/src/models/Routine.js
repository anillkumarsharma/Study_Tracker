import mongoose from "mongoose";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// One document per (user, subject, day) = one editable cell in the grid.
const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    day: {
      type: String,
      enum: DAYS,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// A subject can have only one entry per day.
routineSchema.index({ user: 1, subject: 1, day: 1 }, { unique: true });

export default mongoose.model("Routine", routineSchema);
