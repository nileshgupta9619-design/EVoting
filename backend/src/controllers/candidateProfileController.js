import CandidateProfile from "../models/CandidateProfile.js";
import User from "../models/User.js";
import Election from "../models/Election.js";
import AuditLog from "../models/AuditLog.js";
import { ErrorHandler, asyncHandler } from "../utils/errorHandler.js";

/**
 * Submit candidate profile for election
 * @route POST /api/candidate-profiles/submit
 * @access Private (Approved voters only)
 * @param {string} candidateName - Candidate's full name
 * @param {string} party - Political party name
 * @param {string} description - Candidate biography/description
 * @param {string} electionId - Election ID to contest in
 * @param {string} voterId - Government voter ID
 * @param {string} voterIdDocument - Base64 encoded voter ID document
 * @param {string} profileImage - Candidate profile image URL
 */
export const submitCandidateProfile = asyncHandler(async (req, res, next) => {
  const {
    candidateName,
    party,
    description,
    electionId,
    voterId,
    voterIdDocument,
    profileImage,
  } = req.body;

  const userId = req.user._id || req.user.id;

  // 1. Validate user approval status
  if (!req.user.isApproved) {
    return next(new ErrorHandler("Your account must be approved by admin to become a candidate", 403));
  }

  // 2. Validate required fields
  if (!candidateName) {
    return next(new ErrorHandler("Candidate name is required", 400));
  }
  if (!party) {
    return next(new ErrorHandler("Political party name is required", 400));
  }
  if (!description || description.length < 10) {
    return next(new ErrorHandler("Description must be at least 10 characters", 400));
  }
  if (!electionId) {
    return next(new ErrorHandler("Election ID is required", 400));
  }
  if (!voterId) {
    return next(new ErrorHandler("Voter ID is required", 400));
  }

  // 3. Verify election exists
  const election = await Election.findById(electionId);
  if (!election) {
    return next(new ErrorHandler("Election not found", 404));
  }

  // 4. Check if user already has profile for this election
  const existingProfile = await CandidateProfile.findOne({
    userId,
    election: electionId,
  });
  if (existingProfile) {
    return next(new ErrorHandler("You already have a profile for this election", 409));
  }

  // 5. Check if voter ID is already registered
  const existingVoterId = await CandidateProfile.findOne({ voterId });
  if (existingVoterId) {
    return next(new ErrorHandler("This voter ID is already registered as a candidate", 409));
  }

  // 6. Create candidate profile
  const candidateProfile = new CandidateProfile({
    userId,
    voterId,
    voterIdDocument: voterIdDocument || "",
    candidateName,
    party,
    description,
    profileImage: profileImage || null,
    election: electionId,
    status: "pending",
    voteCount: 0,
  });

  await candidateProfile.save();

  // 7. Log action
  await AuditLog.create({
    userId,
    action: "candidate_profile_submitted",
    targetType: "CandidateProfile",
    targetId: candidateProfile._id,
    details: {
      candidateName,
      party,
      election: election._id,
    },
  });

  // 8. Consistent response
  res.status(201).json({
    success: true,
    message: "Candidate profile submitted successfully. Awaiting admin approval.",
    data: {
      profileId: candidateProfile._id,
      candidateName: candidateProfile.candidateName,
      party: candidateProfile.party,
      status: candidateProfile.status,
      election: election.title,
    },
  });
});

/**
 * Get pending candidate profiles (admin)
 * @route GET /api/candidate-profiles/pending
 * @access Admin
 * @param {string} electionId - Optional election filter
 */
export const getPendingProfiles = asyncHandler(async (req, res, next) => {
  const { electionId } = req.query;

  // 1. Build query
  const query = { status: "pending" };
  if (electionId) {
    query.election = electionId;
  }

  // 2. Fetch profiles
  const profiles = await CandidateProfile.find(query)
    .populate("userId", "fullName email phone governmentIdType")
    .populate("election", "title startDate endDate")
    .sort({ createdAt: -1 });

  // 3. Consistent response
  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles.map((profile) => ({
      profileId: profile._id,
      candidateName: profile.candidateName,
      party: profile.party,
      status: profile.status,
      voterId: profile.voterId,
      user: profile.userId,
      election: profile.election,
      submittedAt: profile.createdAt,
    })),
  });
});

/**
 * Get approved candidate profiles for voting
 * @route GET /api/candidate-profiles/approved
 * @access Public/Private
 * @param {string} electionId - Optional election filter
 */
export const getApprovedProfiles = asyncHandler(async (req, res, next) => {
  const { electionId } = req.query;

  // 1. Build query
  const query = { status: "approved" };
  if (electionId) {
    query.election = electionId;
  }

  // 2. Fetch profiles with vote counts
  const profiles = await CandidateProfile.find(query)
    .populate("userId", "fullName")
    .populate("election", "title")
    .sort("candidateName");

  // 3. Consistent response
  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles.map((profile) => ({
      profileId: profile._id,
      candidateName: profile.candidateName,
      party: profile.party,
      description: profile.description,
      profileImage: profile.profileImage,
      voteCount: profile.voteCount,
      election: profile.election,
    })),
  });
});

/**
 * Get current user's candidate profile
 * @route GET /api/candidate-profiles/my-profile
 * @access Private
 * @param {string} electionId - Optional election filter
 */
export const getUserCandidateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const { electionId } = req.query;

  // 1. Build query
  const query = { userId };
  if (electionId) {
    query.election = electionId;
  }

  // 2. Fetch profile
  const profile = await CandidateProfile.findOne(query).populate(
    "election",
    "title startDate endDate"
  );

  if (!profile) {
    return next(new ErrorHandler("No candidate profile found", 404));
  }

  // 3. Consistent response
  res.status(200).json({
    success: true,
    data: {
      profileId: profile._id,
      candidateName: profile.candidateName,
      party: profile.party,
      description: profile.description,
      profileImage: profile.profileImage,
      status: profile.status,
      voteCount: profile.voteCount,
      election: profile.election,
      voterId: profile.voterId,
      createdAt: profile.createdAt,
      approvalDate: profile.approvalDate,
      rejectionReason: profile.rejectionReason || null,
    },
  });
});

/**
 * Approve candidate profile (admin)
 * @route PUT /api/candidate-profiles/:profileId/approve
 * @access Admin
 */
export const approveCandidateProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;
  const adminId = req.user._id || req.user.id;

  // 1. Find and validate profile
  const profile = await CandidateProfile.findById(profileId);
  if (!profile) {
    return next(new ErrorHandler("Candidate profile not found", 404));
  }

  if (profile.status !== "pending") {
    return next(new ErrorHandler(`Profile is already ${profile.status}`, 400));
  }

  // 2. Approve profile
  profile.status = "approved";
  profile.approvedBy = adminId;
  profile.approvalDate = new Date();
  await profile.save();

  // 3. Populate details for response
  await profile.populate("userId", "fullName email");
  await profile.populate("election", "title");

  // 4. Log action
  await AuditLog.create({
    userId: adminId,
    action: "candidate_profile_approved",
    targetType: "CandidateProfile",
    targetId: profile._id,
    details: {
      candidateName: profile.candidateName,
      party: profile.party,
      election: profile.election?._id,
    },
  });

  // 5. Consistent response
  res.status(200).json({
    success: true,
    message: "Candidate profile approved successfully",
    data: {
      profileId: profile._id,
      candidateName: profile.candidateName,
      party: profile.party,
      status: profile.status,
      approvalDate: profile.approvalDate,
    },
  });
});

/**
 * Reject candidate profile (admin)
 * @route PUT /api/candidate-profiles/:profileId/reject
 * @access Admin
 * @param {string} rejectionReason - Reason for rejection
 */
export const rejectCandidateProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;
  const { rejectionReason } = req.body;
  const adminId = req.user._id || req.user.id;

  // 1. Validate inputs
  if (!rejectionReason) {
    return next(new ErrorHandler("Rejection reason is required", 400));
  }

  // 2. Find and validate profile
  const profile = await CandidateProfile.findById(profileId);
  if (!profile) {
    return next(new ErrorHandler("Candidate profile not found", 404));
  }

  if (profile.status !== "pending") {
    return next(new ErrorHandler(`Profile is already ${profile.status}`, 400));
  }

  // 3. Reject profile
  profile.status = "rejected";
  profile.rejectionReason = rejectionReason;
  profile.rejectedBy = adminId;
  profile.rejectionDate = new Date();
  await profile.save();

  // 4. Populate details for response
  await profile.populate("userId", "fullName email");

  // 5. Log action
  await AuditLog.create({
    userId: adminId,
    action: "candidate_profile_rejected",
    targetType: "CandidateProfile",
    targetId: profile._id,
    details: {
      candidateName: profile.candidateName,
      rejectionReason,
    },
  });

  // 6. Consistent response
  res.status(200).json({
    success: true,
    message: "Candidate profile rejected",
    data: {
      profileId: profile._id,
      candidateName: profile.candidateName,
      status: profile.status,
      rejectionReason: profile.rejectionReason,
    },
  });
});

/**
 * Update candidate profile
 * @route PUT /api/candidate-profiles/:profileId
 * @access Private (Profile owner only)
 * @note Only pending profiles can be updated
 */
export const updateCandidateProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;
  const userId = req.user._id || req.user.id;
  const { candidateName, party, description, profileImage } = req.body;

  // 1. Find profile
  const profile = await CandidateProfile.findById(profileId);
  if (!profile) {
    return next(new ErrorHandler("Candidate profile not found", 404));
  }

  // 2. Authorize user
  if (profile.userId.toString() !== userId.toString()) {
    return next(new ErrorHandler("Not authorized to update this profile", 403));
  }

  // 3. Check profile status
  if (profile.status !== "pending") {
    return next(
      new ErrorHandler(
        `Cannot update ${profile.status} profiles. Only pending profiles can be updated.`,
        400
      )
    );
  }

  // 4. Validate and update fields
  if (candidateName) {
    if (candidateName.length < 3) {
      return next(new ErrorHandler("Candidate name must be at least 3 characters", 400));
    }
    profile.candidateName = candidateName;
  }

  if (party) {
    profile.party = party;
  }

  if (description) {
    if (description.length < 10) {
      return next(new ErrorHandler("Description must be at least 10 characters", 400));
    }
    profile.description = description;
  }

  if (profileImage) {
    profile.profileImage = profileImage;
  }

  await profile.save();

  // 5. Log action
  await AuditLog.create({
    userId,
    action: "candidate_profile_updated",
    targetType: "CandidateProfile",
    targetId: profile._id,
    details: { updatedFields: Object.keys(req.body) },
  });

  // 6. Consistent response
  res.status(200).json({
    success: true,
    message: "Candidate profile updated successfully",
    data: {
      profileId: profile._id,
      candidateName: profile.candidateName,
      party: profile.party,
      description: profile.description,
      profileImage: profile.profileImage,
      status: profile.status,
    },
  });
});
