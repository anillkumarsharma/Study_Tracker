import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies the Bearer token and attaches the user to req.user.
export const protect = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
