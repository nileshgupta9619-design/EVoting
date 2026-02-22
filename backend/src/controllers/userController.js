import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/helpers.js";
import { sendOTP } from "../utils/emailService.js";
import { ErrorHandler, asyncHandler } from "../utils/errorHandler.js";
import AuditLog from "../models/AuditLog.js";

/**
 * Change password for logged-in user
 * @route PUT /api/user/:userId/change-password
 * @access Private
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Password confirmation
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id || req.user.id;

  // 1. Validate inputs
  if (!currentPassword) {
    return next(new ErrorHandler("Current password is required", 400));
  }
  if (!newPassword) {
    return next(new ErrorHandler("New password is required", 400));
  }
  if (!confirmPassword) {
    return next(new ErrorHandler("Password confirmation is required", 400));
  }

  // 2. Validate password format
  if (newPassword.length < 8) {
    return next(new ErrorHandler("New password must be at least 8 characters", 400));
  }

  // 3. Check passwords match
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // 4. Verify new password is different
  const isNewSameAsCurrent = await bcrypt.compare(newPassword, req.user.password);
  if (isNewSameAsCurrent) {
    return next(new ErrorHandler("New password must be different from current password", 400));
  }

  // 5. Get user with password field
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 6. Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return next(new ErrorHandler("Current password is incorrect", 401));
  }

  // 7. Hash and save new password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // 8. Log action
  await AuditLog.create({
    userId: user._id,
    action: "password_changed",
    targetType: "User",
    targetId: user._id,
    details: { email: user.email },
  });

  // 9. Consistent response
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Forgot password - Send reset OTP to email
 * @route POST /api/user/forgot-password
 * @access Public
 * @param {string} email - User email address
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1. Validate input
  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }

  // 2. Find user
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("No user found with this email", 404));
  }

  // 3. Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // 4. Send OTP email
  const sent = await sendOTP(email, otp);
  if (!sent) {
    return next(new ErrorHandler("Failed to send reset OTP", 500));
  }

  // 5. Log action
  // await AuditLog.create({
  //   userId: user._id,
  //   action: "password_reset_requested",
  //   targetType: "User",
  //   targetId: user._id,
  //   details: { email: user.email },
  // });

  // 6. Consistent response
  res.status(200).json({
    success: true,
    message: "Password reset OTP sent to your email",
    data: {
      userId: user._id,
      email: user.email,
      expiresIn: "15 minutes",
    },
  });
});

/**
 * Reset password using OTP
 * @route POST /api/user/reset-password
 * @access Public
 * @param {string} userId - User ID
 * @param {string} otp - One-time password from email
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Password confirmation
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { userId, otp, newPassword, confirmPassword } = req.body;

  // 1. Validate inputs
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }
  if (!otp) {
    return next(new ErrorHandler("OTP is required", 400));
  }
  if (!newPassword) {
    return next(new ErrorHandler("New password is required", 400));
  }
  if (!confirmPassword) {
    return next(new ErrorHandler("Password confirmation is required", 400));
  }

  // 2. Validate password format
  if (newPassword.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters", 400));
  }

  // 3. Check passwords match
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // 4. Get user with OTP fields
  const user = await User.findById(userId).select("+otp +otpExpiry +password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 5. Verify OTP
  if (user.otp !== otp.toString()) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  // 6. Check OTP expiry
  if (new Date() > user.otpExpiry) {
    return next(new ErrorHandler("OTP has expired", 400));
  }

  // 7. Verify new password is different
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return next(new ErrorHandler("New password must be different from current password", 400));
  }

  // 8. Hash and save new password
  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  // 9. Log action
  await AuditLog.create({
    userId: user._id,
    action: "password_reset_completed",
    targetType: "User",
    targetId: user._id,
    details: { email: user.email },
  });

  // 10. Consistent response
  res.status(200).json({
    success: true,
    message: "Password reset successfully. Please login with your new password.",
  });
});

/**
 * Update user profile
 * @route PUT /api/user/:userId
 * @access Private
 * @param {string} fullName - User's full name
 * @param {string} phone - User's phone number
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { fullName, phone } = req.body;
  const userId = req.user._id || req.user.id;

  // 1. Validate inputs
  if (!fullName && !phone) {
    return next(new ErrorHandler("At least one field is required to update", 400));
  }

  if (fullName && fullName.length < 3) {
    return next(new ErrorHandler("Full name must be at least 3 characters", 400));
  }

  // 2. Build update object
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;

  // 3. Update user
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 4. Log action
  await AuditLog.create({
    userId: user._id,
    action: "profile_updated",
    targetType: "User",
    targetId: user._id,
    details: { updatedFields: Object.keys(updateData) },
  });

  // 5. Consistent response
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      updatedAt: user.updatedAt,
    },
  });
});

/**
 * Get user profile
 * @route GET /api/user/:userId
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;

  // 1. Get user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 2. Consistent response
  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified,
      isApproved: user.isApproved,
      electionVotes: user.electionVotes || [],
      governmentIdType: user.governmentIdType || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

/**
 * Delete user account
 * @route DELETE /api/user/:userId
 * @access Private
 * @param {string} password - User password for verification
 */
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const userId = req.user._id || req.user.id;

  // 1. Validate input
  if (!password) {
    return next(new ErrorHandler("Password is required to delete account", 400));
  }

  // 2. Get user with password field
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 3. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  // 4. Log action before deletion
  const userEmail = user.email;
  const userName = user.fullName;

  await AuditLog.create({
    userId: user._id,
    action: "account_deleted",
    targetType: "User",
    targetId: user._id,
    details: { email: userEmail, fullName: userName },
  });

  // 5. Delete user
  await User.findByIdAndDelete(userId);

  // 6. Consistent response
  res.status(200).json({
    success: true,
    message: "Account deleted successfully. All associated data has been removed.",
  });
});

/**
 * Get voting history
 * @route GET /api/user/:userId/voting-history
 * @access Private
 */
export const getVotingHistory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;

  // 1. Get user with voting data
  const user = await User.findById(userId)
    .populate("electionVotes.electionId", "title startDate endDate")
    .lean();

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 2. Consistent response
  res.status(200).json({
    success: true,
    count: user.electionVotes?.length || 0,
    data: {
      userId: user._id,
      totalVotes: user.electionVotes?.length || 0,
      electionVotes: user.electionVotes || [],
    },
  });
});
