import express from "express";
import {
  listSubjects,
  createSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // all subject routes require login

router.get("/", listSubjects);
router.post("/", createSubject);
router.delete("/:id", deleteSubject);

export default router;
