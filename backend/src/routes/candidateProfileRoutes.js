import express from "express";
import {
  submitCandidateProfile,
  getPendingProfiles,
  getApprovedProfiles,
  getUserCandidateProfile,
  approveCandidateProfile,
  rejectCandidateProfile,
  updateCandidateProfile,
} from "../controllers/candidateProfileController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Voter routes
router.post("/submit", protect, submitCandidateProfile);
router.get("/my-profile", protect, getUserCandidateProfile);
router.put("/:profileId", protect, updateCandidateProfile);

// Public routes
router.get("/approved", getApprovedProfiles);

// Admin routes
router.get("/pending", protect, authorize("admin"), getPendingProfiles);
router.put("/:profileId/approve",protect,authorize("admin"),approveCandidateProfile,);
router.put(  "/:profileId/reject",  protect,  authorize("admin"),  rejectCandidateProfile,);

export default router;
