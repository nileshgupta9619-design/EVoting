import express from "express";
import {
  adminLogin,
  getAllUsers,
  approveVoter,
  rejectVoter,
  assignElectionToVoter,
  createAdmin,
  getAuditLogs,
  getPendingRegistrations,
  approveUserRegistration,
  rejectUserRegistration,
  getElectionReports,
  getSystemStatistics,
  getElectionActivityMonitoring,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public admin login
router.post("/login", adminLogin);

// Protected admin routes - User Registration Management
router.get("/pending-registrations",protect,authorize("admin"),getPendingRegistrations,);
router.put("/registrations/:userId/approve",protect,authorize("admin"),approveUserRegistration,);
router.put("/registrations/:userId/reject",protect,authorize("admin"),rejectUserRegistration,);

// Protected admin routes - User Management
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:userId/approve", protect, authorize("admin"), approveVoter);
router.put("/users/:userId/reject", protect, authorize("admin"), rejectVoter);
router.put("/users/:userId/assign-election",protect,authorize("admin"),assignElectionToVoter,);
router.post("/create", protect, authorize("admin"), createAdmin);
router.get("/logs", protect, authorize("admin"), getAuditLogs);

// Protected admin routes - Reports and Monitoring
router.get("/reports/election/:electionId",protect,authorize("admin"),getElectionReports,);
router.get("/reports/system-statistics",protect,authorize("admin"),getSystemStatistics,);
router.get("/monitor/election/:electionId",protect,authorize("admin"),getElectionActivityMonitoring,);
// GET    /admin/users
// GET    /admin/users?status=approved
// GET    /admin/users?status=rejected
// PATCH  /admin/users/:id/approve
// PATCH  /admin/users/:id/reject

export default router;
