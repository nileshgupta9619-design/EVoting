import express from "express";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
  getUserProfile,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/change-password", protect, changePassword);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.delete("/account", protect, deleteAccount);

// Public routes (no authentication needed)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
