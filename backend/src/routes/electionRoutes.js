import express from "express";
import {
  createElection,
  getAllElections,
  getElectionById,
  startVoting,
  stopVoting,
  getElectionCandidates,
  updateElection,
  deleteElection,
  getElectionResults,
  getAllElectionsResults,
} from "../controllers/electionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Protected routes for voters (only approved voters can view elections/candidates)
router.get("/", protect, getAllElections);
router.get("/:electionId", protect, getElectionById);
router.get("/:electionId/candidates", protect, getElectionCandidates);
// Results are available to anyone only after election stopped
router.get("/:electionId/results", getElectionResults);

// Get all elections with their results (public)
router.get("/results/all", getAllElectionsResults);

// Admin routes
router.post("/", protect, authorize("admin"), createElection);
router.patch("/:electionId", protect, authorize("admin"), updateElection);
router.delete("/:electionId", protect, authorize("admin"), deleteElection);
router.patch("/:electionId/start", protect, authorize("admin"), startVoting);
router.patch("/:electionId/stop", protect, authorize("admin"), stopVoting);

export default router;
