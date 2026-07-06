import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    color: {
      type: String,
      default: "#4C6EF5",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
