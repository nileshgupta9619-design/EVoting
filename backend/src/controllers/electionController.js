import Election from "../models/Election.js";
import CandidateProfile from "../models/CandidateProfile.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { ErrorHandler, asyncHandler } from "../utils/errorHandler.js";

/**
 * Create election (admin only)
 * @route POST /api/elections
 * @access Admin
 */
export const createElection = asyncHandler(async (req, res, next) => {
  const { title, description, startDate, endDate } = req.body;
  const adminId = req.user._id;

  if (!title) {
    return next(new ErrorHandler("Election title is required", 400));
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return next(new ErrorHandler("End date must be after start date", 400));
    }
  }

  const election = await Election.create({
    title,
    description: description || "",
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    createdBy: adminId,
  });

  await AuditLog.create({
    userId: adminId,
    action: "create_election",
    targetType: "Election",
    targetId: election._id,
    details: { title: election.title },
  });

  res.status(201).json({
    success: true,
    message: "Election created successfully",
    data: election,
  });
});

/**
 * Get all active elections with time validation
 * @route GET /api/elections
 * @access Private (Approved voters only)
 */
export const getAllElections = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.isApproved) {
    return next(new ErrorHandler("Not authorized to view elections", 403));
  }

  const now = new Date();

  const elections = await Election.find({
    isActive: true,
    $or: [
      {
        startDate: { $lte: now },
        endDate: { $gte: now },
      },
      {
        startDate: null,
        endDate: null,
        isActive: true,
      },
    ],
  })
    .populate("createdBy", "fullName email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: elections.length,
    data: elections,
  });
});

/**
 * Get election by ID
 * @route GET /api/elections/:electionId
 * @access Private (Approved voters only)
 */
export const getElectionById = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.isApproved) {
    return next(new ErrorHandler("Not authorized to view this election", 403));
  }

  const { electionId } = req.params;

  const election = await Election.findById(electionId).populate(
    "createdBy",
    "fullName email",
  );

  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  res.status(200).json({
    success: true,
    data: election,
  });
});

/**
 * Start voting (admin only)
 * @route PUT /api/elections/:electionId/start
 * @access Admin
 */
export const startVoting = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;

  const election = await Election.findByIdAndUpdate(
    electionId,
    {
      isActive: true,
      startDate: new Date(),
    },
    { new: true },
  );

  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  await AuditLog.create({
    userId: req.user._id,
    action: "start_election",
    targetType: "Election",
    targetId: election._id,
    details: { title: election.title },
  });

  res.status(200).json({
    success: true,
    message: "Voting started successfully",
    data: election,
  });
});

/**
 * Stop voting (admin only)
 * @route PUT /api/elections/:electionId/stop
 * @access Admin
 */
export const stopVoting = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;

  const election = await Election.findByIdAndUpdate(
    electionId,
    {
      isActive: false,
      endDate: new Date(),
    },
    { new: true },
  );

  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  await AuditLog.create({
    userId: req.user._id,
    action: "stop_election",
    targetType: "Election",
    targetId: election._id,
    details: { title: election.title },
  });

  res.status(200).json({
    success: true,
    message: "Voting stopped successfully",
    data: election,
  });
});

/**
 * Get candidates for election (only approved profiles)
 * @route GET /api/elections/:electionId/candidates
 * @access Private (Approved voters only)
 */
export const getElectionCandidates = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.isApproved) {
    return next(new ErrorHandler("Not authorized to view candidates", 403));
  }

  const { electionId } = req.params;

  const election = await Election.findById(electionId);
  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  const candidates = await CandidateProfile.find({
    election: electionId,
    status: "approved",
  })
    .populate("userId", "fullName")
    .sort({ candidateName: 1 });

  res.status(200).json({
    success: true,
    count: candidates.length,
    data: candidates,
  });
});

/**
 * Update election (admin only)
 * @route PUT /api/elections/:electionId
 * @access Admin
 */
export const updateElection = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;
  const { title, description, startDate, endDate, isActive } = req.body;

  const election = await Election.findById(electionId);
  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  if (title) election.title = title;
  if (description !== undefined) election.description = description;
  if (startDate) election.startDate = new Date(startDate);
  if (endDate) election.endDate = new Date(endDate);
  if (isActive !== undefined) election.isActive = isActive;

  // Validate dates
  if (election.startDate && election.endDate) {
    if (election.startDate >= election.endDate) {
      return next(new ErrorHandler("End date must be after start date", 400));
    }
  }

  await election.save();

  await AuditLog.create({
    userId: req.user._id,
    action: "update_election",
    targetType: "Election",
    targetId: election._id,
    details: { title: election.title },
  });

  res.status(200).json({
    success: true,
    message: "Election updated successfully",
    data: election,
  });
});

/**
 * Delete election (admin only)
 * @route DELETE /api/elections/:electionId
 * @access Admin
 */
export const deleteElection = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;

  const election = await Election.findByIdAndDelete(electionId);

  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  // Delete all candidate profiles for this election
  await CandidateProfile.deleteMany({ election: electionId });

  await AuditLog.create({
    userId: req.user._id,
    action: "delete_election",
    targetType: "Election",
    targetId: electionId,
    details: { title: election?.title || null },
  });

  res.status(200).json({
    success: true,
    message: "Election deleted successfully",
  });
});

/**
 * Get election results with detailed statistics
 * @route GET /api/elections/:electionId/results
 * @access Public
 */
export const getElectionResults = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;

  const election = await Election.findById(electionId);
  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  const candidates = await CandidateProfile.find({
    election: electionId,
    status: "approved",
  }).sort({ voteCount: -1 });

  const totalVotes = candidates.reduce(
    (acc, cand) => acc + (cand.voteCount || 0),
    0,
  );

  const results = candidates.map((candidate) => ({
    id: candidate._id,
    name: candidate.candidateName,
    party: candidate.party,
    voteCount: candidate.voteCount || 0,
    percentage:
      totalVotes > 0
        ? ((candidate.voteCount / totalVotes) * 100).toFixed(2)
        : "0",
  }));

  res.status(200).json({
    success: true,
    data: {
      election: {
        id: election._id,
        title: election.title,
        isActive: election.isActive,
        status: election.isActive ? "Live Results" : "Final Results",
        startDate: election.startDate,
        endDate: election.endDate,
      },
      totalVotes,
      candidateCount: results.length,
      results,
    },
  });
});
