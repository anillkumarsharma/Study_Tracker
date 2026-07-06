import express from "express";
import {
  listSessions,
  createSession,
  deleteSession,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", listSessions);
router.post("/", createSession);
router.delete("/:id", deleteSession);

export default router;
