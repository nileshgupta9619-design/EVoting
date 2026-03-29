import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/helpers.js";
import AuditLog from "../models/AuditLog.js";
import Election from "../models/Election.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Vote from "../models/Vote.js";

// Approve voter (admin)
export const approveVoter = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true,accountStatus:"approved" },
      { new: true },
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await AuditLog.create({
      adminId,
      action: "approve_voter",
      targetType: "User",
      targetId: user._id,
      details: { email: user.email },
    });

    return res
      .status(200)
      .json({ success: true, message: "Voter approved", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reject voter (admin)
export const rejectVoter = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: false, accountStatus: "rejected" },
      { new: true },
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await AuditLog.create({
      adminId,
      action: "reject_voter",
      targetType: "User",
      targetId: user._id,
      details: { reason },
    });

    return res
      .status(200)
      .json({ success: true, message: "Voter rejected", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Assign election to voter
export const assignElectionToVoter = async (req, res) => {
  try {
    const { userId } = req.params;
    const { electionId } = req.body;
    const adminId = req.user._id;

    const election = await Election.findById(electionId);
    if (!election)
      return res
        .status(404)
        .json({ success: false, message: "Election not found" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.allowedElections.includes(electionId)) {
      user.allowedElections.push(electionId);
      await user.save();
    }

    await AuditLog.create({
      adminId,
      action: "assign_election_to_voter",
      targetType: "User",
      targetId: user._id,
      details: { electionId },
    });

    return res
      .status(200)
      .json({ success: true, message: "Election assigned to voter", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create admin by existing admin
export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const adminId = req.user._id;

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      isApproved: true,
    });
    await user.save();

    await AuditLog.create({
      adminId,
      action: "create_admin",
      targetType: "User",
      targetId: user._id,
      details: { email },
    });

    return res
      .status(201)
      .json({ success: true, message: "Admin created", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit logs (admin)
// export const getAuditLogs = async (req, res) => {
//   try {
//     const logs = await AuditLog.find()
//       .populate("adminId", "fullName email")
//       .sort({ createdAt: -1 });
//     return res.status(200).json({ success: true, count: logs.length, logs });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// Admin login
export const adminLogin = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    const admin = await User.findOne({ email, role: "admin" }).select(
      "+password",
    );

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    const token = generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending account registrations (admin)
export const getPendingRegistrations = async (req, res) => {
  try {
    const pendingUsers = await User.find({ accountStatus: "pending" })
      .select(
        "fullName email phone governmentIdType governmentIdNumber govermentIdDocumentUrl isEmailVerified createdAt",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Approve user registration (admin)
export const approveUserRegistration = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        accountStatus: "approved",
        isApproved: true,
        approvedBy: adminId,
        approvalDate: new Date(),
      },
      { new: true },
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await AuditLog.create({
      adminId,
      action: "approve_registration",
      targetType: "User",
      targetId: user._id,
      details: { email: user.email, governmentId: user.governmentIdNumber },
    });

    return res.status(200).json({
      success: true,
      message: "User registration approved",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reject user registration (admin)
export const rejectUserRegistration = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rejection reason",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        accountStatus: "rejected",
        rejectionReason: reason,
      },
      { new: true },
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await AuditLog.create({
      adminId,
      action: "reject_registration",
      targetType: "User",
      targetId: user._id,
      details: { email: user.email, reason },
    });

    return res.status(200).json({
      success: true,
      message: "User registration rejected",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get comprehensive election reports including vote counts, statistics, and analytics
 */
export const getElectionReports = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Get vote counts from Vote model or Election model
    const totalVotes = election.totalVotes || 0;

    // Get candidate votes
    const candidateProfiles = await CandidateProfile.find({
      election: electionId,
      status: "approved",
    })
      .populate("candidate")
      .sort({ voteCount: -1 });

    const candidateStats = candidateProfiles.map((profile) => ({
      candidateId: profile.candidate._id,
      name: profile.candidate.name,
      party: profile.candidate.party,
      voteCount: profile.voteCount || 0,
      percentage:
        totalVotes > 0
          ? ((profile.voteCount / totalVotes) * 100).toFixed(2)
          : 0,
    }));

    // Get registration statistics
    const totalRegistrations = await User.countDocuments();
    const approvedRegistrations = await User.countDocuments({
      accountStatus: "approved",
    });
    const pendingRegistrations = await User.countDocuments({
      accountStatus: "pending",
    });
    const rejectedRegistrations = await User.countDocuments({
      accountStatus: "rejected",
    });

    // Get audit log for this election
    const auditLogs = await AuditLog.find({
      targetType: "Election",
      targetId: electionId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      election: {
        id: election._id,
        name: election.name,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive,
      },
      voteStatistics: {
        totalVotes,
        candidatesCount: candidateStats.length,
        candidates: candidateStats,
      },
      registrationStatistics: {
        totalRegistrations,
        approvedCount: approvedRegistrations,
        pendingCount: pendingRegistrations,
        rejectedCount: rejectedRegistrations,
      },
      auditLog: auditLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get system-wide statistics and audit logs
 */
export const getSystemStatistics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalApprovedUsers = await User.countDocuments({ isApproved: true });
    const totalVoters = await User.countDocuments({ role: "voter" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const usersWhoVoted = await User.countDocuments({ hasVoted: true });

    // Registration status statistics
    const registrationStats = {
      pending: await User.countDocuments({ accountStatus: "pending" }),
      approved: await User.countDocuments({ accountStatus: "approved" }),
      rejected: await User.countDocuments({ accountStatus: "rejected" }),
    };

    // Election statistics
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ isActive: true });
    const completedElections = await Election.countDocuments({
      isActive: false,
    });

    // Audit log statistics
    const recentAuditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    // Count activities by type
    const auditActivities = {};
    recentAuditLogs.forEach((log) => {
      auditActivities[log.action] = (auditActivities[log.action] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          approved: totalApprovedUsers,
          voters: totalVoters,
          admins: totalAdmins,
          hasVoted: usersWhoVoted,
        },
        registrations: registrationStats,
        elections: {
          total: totalElections,
          active: activeElections,
          completed: completedElections,
        },
        auditLog: {
          totalRecords: recentAuditLogs.length,
          activitiesByType: auditActivities,
          recentActivities: recentAuditLogs.slice(0, 20),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      action,
      targetType,
      startDate,
      endDate,
      limit = 50,
      page = 1,
    } = req.query;

    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * parseInt(limit);

    const auditLogs = await AuditLog.find(filter)
      .populate("adminId", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: auditLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get real-time election activity monitoring
 */
export const getElectionActivityMonitoring = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const voteCount = await Vote.countDocuments({ election: electionId });

    // Get recent votes (last 10)
    const recentVotes = await Vote.find({ election: electionId })
      .sort({ votedAt: -1 })
      .limit(10)
      .select("receiptCode votedAt");

    // Get votes per hour (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const votesByHour = await Vote.aggregate([
      {
        $match: {
          election: electionId,
          votedAt: { $gte: last24Hours },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:00",
              date: "$votedAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get candidate performance in real-time
    const candidatePerformance = await CandidateProfile.find({
      election: electionId,
      status: "approved",
    })
      .populate("candidate", "name party")
      .sort({ voteCount: -1 })
      .limit(10);

    // Get registration status update
    const registrationStatus = {
      total: await User.countDocuments(),
      approved: await User.countDocuments({ accountStatus: "approved" }),
      pending: await User.countDocuments({ accountStatus: "pending" }),
      rejected: await User.countDocuments({ accountStatus: "rejected" }),
    };

    return res.status(200).json({
      success: true,
      election: {
        id: election._id,
        name: election.name,
        isActive: election.isActive,
      },
      activity: {
        totalVotes: voteCount,
        recentVotes: recentVotes,
        votesByHour: votesByHour,
        topCandidates: candidatePerformance.map((cp) => ({
          name: cp.candidate.name,
          party: cp.candidate.party,
          voteCount: cp.voteCount,
        })),
      },
      registrationStatus: registrationStatus,
      lastUpdated: new Date(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
