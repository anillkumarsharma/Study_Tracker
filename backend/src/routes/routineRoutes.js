import express from "express";
import { getRoutine, setCell } from "../controllers/routineController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getRoutine);
router.put("/", setCell); // upsert a single cell

export default router;
