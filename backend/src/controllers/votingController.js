import Candidate from "../models/Candidate.js";
import User from "../models/User.js";
import Election from "../models/Election.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Vote from "../models/Vote.js";
import AuditLog from "../models/AuditLog.js";
import {
  encrypt,
  makeVoterHash,
  computeChecksum,
} from "../utils/cryptoUtils.js";
import { generateReceiptCode } from "../utils/helpers.js";
import { ErrorHandler, asyncHandler } from "../utils/errorHandler.js";

/**
 * Get all candidates (legacy)
 * @route GET /api/voting/candidates
 * @access Public
 */
export const getAllCandidates = asyncHandler(async (req, res) => {
  const candidates = await CandidateProfile.find().sort({ voteCount: -1 });

  res.status(200).json({
    success: true,
    count: candidates.length,
    data: candidates,
  });
});

/**
 * Get candidate by ID (legacy)
 * @route GET /api/voting/candidates/:id
 * @access Public
 */
export const getCandidateById = asyncHandler(async (req, res, next) => {
  const candidate = await CandidateProfile.findById(req.params.id);

  if (!candidate) {
    return next(new ErrorHandler("Candidate not found", 404));
  }

  res.status(200).json({
    success: true,
    data: candidate,
  });
});

/**
 * Create a new candidate (legacy)
 * @route POST /api/voting/candidates
 * @access Admin
 */
export const createCandidate = asyncHandler(async (req, res, next) => {
  const { name, party, description, image } = req.body;

  if (!name || !party) {
    return next(new ErrorHandler("Name and party are required", 400));
  }

  const candidate = await Candidate.create({
    name,
    party,
    description: description || "",
    image: image || null,
  });

  await AuditLog.create({
    userId: req.user._id,
    action: "create_candidate",
    targetType: "Candidate",
    targetId: candidate._id,
    details: { name: candidate.name },
  });

  res.status(201).json({
    success: true,
    message: "Candidate created successfully",
    data: candidate,
  });
});

/**
 * Delete a candidate (legacy)
 * @route DELETE /api/voting/candidates/:id
 * @access Admin
 */
export const deleteCandidate = asyncHandler(async (req, res, next) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);

  if (!candidate) {
    return next(new ErrorHandler("Candidate not found", 404));
  }

  await AuditLog.create({
    userId: req.user._id,
    action: "delete_candidate",
    targetType: "Candidate",
    targetId: req.params.id,
    details: { name: candidate.name },
  });

  res.status(200).json({
    success: true,
    message: "Candidate deleted successfully",
  });
});

/**
 * Vote in an election
 * @route POST /api/voting/election/:electionId/vote
 * @access Private (Approved voters only)
 */
export const voteInElection = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;
  const {  candidateProfileId } = req.body;
  const userId = req.user._id;
  const now = new Date();
  console.log(electionId,candidateProfileId,userId)
  if (!electionId || !candidateProfileId) {
    return next(
      new ErrorHandler(
        "Election ID and Candidate Profile ID are required",
        400,
      ),
    );
  }

  const user = await User.findById(userId);
  if (!user || !user.isApproved) {
    return next(new ErrorHandler("User is not approved for voting", 403));
  }

  const election = await Election.findById(electionId);
  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  if (!election.isActive) {
    return next(new ErrorHandler("This election is not currently active", 400));
  }

  if (election.startDate && election.endDate) {
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    if (now < startDate) {
      return next(
        new ErrorHandler("Voting has not started yet for this election", 400),
      );
    }
    if (now > endDate) {
      return next(new ErrorHandler("Voting has ended for this election", 400));
    }
  }

  const hasVotedInElection = user.electionVotes.some(
    (vote) => vote.electionId.toString() === electionId,
  );

  if (hasVotedInElection) {
    return next(
      new ErrorHandler("You have already voted in this election", 400),
    );
  }

  const candidateProfile =
    await CandidateProfile.findById(candidateProfileId).populate("userId");

  if (!candidateProfile) {
    return next(new ErrorHandler("Candidate profile not found", 404));
  }

  if (candidateProfile.status !== "approved") {
    return next(
      new ErrorHandler("Candidate profile is not approved for voting", 400),
    );
  }

  if (candidateProfile.election.toString() !== electionId) {
    return next(
      new ErrorHandler("Candidate does not belong to this election", 400),
    );
  }

  const encryptedCandidate = encrypt(candidateProfileId.toString());
  const voterHash = makeVoterHash(userId.toString());
  const checksum = computeChecksum(encryptedCandidate);
  const receiptCode = generateReceiptCode();

  const vote = await Vote.create({
    election: electionId,
    user: userId,
    encryptedCandidate,
    voterHash,
    checksum,
    receiptCode,
    isEncrypted: true,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    votedAt: now,
  });

  user.electionVotes.push({
    electionId,
    candidateId: candidateProfileId,
    votedAt: now,
  });
  await user.save();

  candidateProfile.voteCount = (candidateProfile.voteCount || 0) + 1;
  await candidateProfile.save();

  election.totalVotes = (election.totalVotes || 0) + 1;
  await election.save();

  await AuditLog.create({
    adminId:userId,
    action: "vote_cast",
    targetType: "Vote",
    targetId: vote._id,
    details: {
      electionId,
      candidateProfileId,
      receiptCode,
    },
  });

  res.status(200).json({
    success: true,
    message: "Vote cast successfully",
    data: {
      receiptCode,
      note: "Save this receipt code to verify your vote after the election",
    },
  });
});

/**
 * Legacy vote function
 * @route POST /api/voting/vote
 * @access Private
 */
export const vote = asyncHandler(async (req, res, next) => {
  const { candidateId } = req.body;
  const userId = req.user._id;

  if (!candidateId) {
    return next(new ErrorHandler("Candidate ID is required", 400));
  }

  const user = await User.findById(userId);

  if (user.hasVoted) {
    return next(new ErrorHandler("You have already voted", 400));
  }

  const candidate = await CandidateProfile.findById(candidateId);

  if (!candidate) {
    return next(new ErrorHandler("Candidate not found", 404));
  }

  user.hasVoted = true;
  user.votedFor = candidateId;
  await user.save();

  candidate.voteCount = (candidate.voteCount || 0) + 1;
  await candidate.save();

  res.status(200).json({
    success: true,
    message: "Vote cast successfully",
  });
});

/**
 * Get legacy voting results
 * @route GET /api/voting/results
 * @access Public
 */
export const getResults = asyncHandler(async (req, res) => {
  const candidates = await Candidate.find().sort({ voteCount: -1 });

  const totalVotes = candidates.reduce(
    (acc, cand) => acc + (cand.voteCount || 0),
    0,
  );

  const results = candidates.map((candidate) => ({
    id: candidate._id,
    name: candidate.name,
    party: candidate.party,
    voteCount: candidate.voteCount || 0,
    percentage:
      totalVotes > 0
        ? ((candidate.voteCount / totalVotes) * 100).toFixed(2)
        : "0",
  }));

  res.status(200).json({
    success: true,
    totalVotes,
    candidateCount: results.length,
    data: results,
  });
});

/**
 * Check if user has voted in election
 * @route GET /api/voting/election/:electionId/has-voted
 * @access Private
 */
export const hasUserVotedInElection = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const hasVoted = user.electionVotes.some(
    (vote) => vote.electionId.toString() === electionId,
  );

  res.status(200).json({
    success: true,
    hasVoted,
    electionId,
  });
});

/**
 * Verify vote by receipt code
 * @route POST /api/voting/verify-receipt
 * @access Public
 */
export const verifyVoteByReceipt = asyncHandler(async (req, res, next) => {
  const { receiptCode } = req.body;

  if (!receiptCode || receiptCode.trim() === "") {
    return next(new ErrorHandler("Receipt code is required", 400));
  }

  const vote = await Vote.findOne({ receiptCode }).populate(
    "election",
    "title",
  );

  if (!vote) {
    return next(new ErrorHandler("Invalid receipt code. No vote found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Vote verified successfully",
    data: {
      receiptCode: vote.receiptCode,
      electionTitle: vote.election.title,
      votedAt: vote.votedAt,
      status: "Verified - Your vote has been recorded",
      isEncrypted: vote.isEncrypted,
    },
  });
});

/**
 * Get user's vote receipt for election
 * @route GET /api/voting/election/:electionId/receipt
 * @access Private
 */
export const getUserVoteReceipt = asyncHandler(async (req, res, next) => {
  const { electionId } = req.params;
  const userId = req.user._id;

  const vote = await Vote.findOne({
    election: electionId,
    user: userId,
  }).populate("election", "title");

  if (!vote) {
    return next(new ErrorHandler("No vote found for this election", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      receiptCode: vote.receiptCode,
      electionTitle: vote.election.title,
      votedAt: vote.votedAt,
      verificationCode: vote.receiptCode,
    },
  });
});
