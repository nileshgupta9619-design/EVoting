import express from "express";
import { adminLogin, getAllUsers } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public admin login
router.post("/login", adminLogin);

// Protected admin routes
router.get("/users", protect, authorize("admin"), getAllUsers);

export default router;

