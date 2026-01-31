import express from "express";
import {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  deleteCandidate,
  vote,
  getResults,
} from "../controllers/votingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/candidates", getAllCandidates);
router.get("/candidates/:id", getCandidateById);
router.get("/results", getResults);
router.post("/vote", protect, vote);

// Admin routes
router.post("/candidates", protect, authorize("admin"), createCandidate);
router.delete("/candidates/:id", protect, authorize("admin"), deleteCandidate);

export default router;
