import express from "express";
import {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  deleteCandidate,
  vote,
  voteInElection,
  getResults,
  hasUserVotedInElection,
  verifyVoteByReceipt,
  getUserVoteReceipt,
} from "../controllers/votingController.js";
import { getElectionResults } from "../controllers/electionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Legacy routes
router.get("/candidates", getAllCandidates);
router.get("/candidates/:id", getCandidateById);
router.get("/results", getResults);
// router.post("/vote", protect, vote);//not need as we have voteInElection

// Election-based voting routes
router.post("/election/:electionId/vote", protect, voteInElection);
router.get("/election/:electionId/has-voted", protect, hasUserVotedInElection);
router.get("/election/:electionId/results", getElectionResults);
router.get("/election/:electionId/receipt", protect, getUserVoteReceipt);

// Vote verification routes (public - anyone can verify with receipt code)
router.post("/verify-receipt", verifyVoteByReceipt);

// Admin routes
router.post("/candidates", protect, authorize("admin"), createCandidate);
router.delete("/candidates/:id", protect, authorize("admin"), deleteCandidate);

export default router;
