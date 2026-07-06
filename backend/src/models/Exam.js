import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    // Optional link to a subject (for its colour on the countdown).
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    date: {
      type: Date,
      required: [true, "Exam date is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
