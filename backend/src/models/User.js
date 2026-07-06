import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // Passwordless: the 6-char username is the only credential.
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]{6}$/, "Username must be exactly 6 letters or digits"],
    },
    // 0 = derive the weekly goal from the routine's planned hours.
    weeklyGoalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
