import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
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
    time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format"],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
