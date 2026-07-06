import jwt from "jsonwebtoken";

// Long-lived token so a logged-in user stays signed in (matches the
// "no logout" requirement on the frontend).
export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "365d" });
