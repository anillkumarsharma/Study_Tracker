import express from "express";
import { chat, getHistory, clearHistory } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, chat);
router.get("/history", protect, getHistory);
router.delete("/history", protect, clearHistory);

export default router;
