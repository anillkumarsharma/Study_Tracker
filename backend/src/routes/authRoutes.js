import express from "express";
import {
  login,
  register,
  me,
  updateGoal,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login); // passwordless find-or-create
router.post("/register", register); // strict create
router.get("/me", protect, me);
router.patch("/goal", protect, updateGoal);

export default router;
