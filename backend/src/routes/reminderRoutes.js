import express from "express";
import {
  listReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
} from "../controllers/reminderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", listReminders);
router.post("/", createReminder);
router.patch("/:id/toggle", toggleReminder);
router.delete("/:id", deleteReminder);

export default router;
