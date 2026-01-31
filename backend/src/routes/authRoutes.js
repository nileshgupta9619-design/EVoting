import express from "express";
import {
  register,
  verifyOTP,
  login,
  getMe,
  resendOTP,
} from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validateRegister, handleValidationErrors, register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", validateLogin, handleValidationErrors, login);
router.get("/me", protect, getMe);

export default router;
