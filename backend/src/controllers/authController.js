import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken, generateOTP } from "../utils/helpers.js";
import { sendOTP } from "../utils/emailService.js";
import { sendSMS } from "../utils/smsService.js";
import { ErrorHandler, asyncHandler } from "../utils/errorHandler.js";

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @param {string} fullName - User's full name
 * @param {string} email - User's email address
 * @param {string} phone - User's phone number
 * @param {string} password - User's password (min 8 chars)
 * @param {string} governmentIdType - Type of government ID (aadhar, pan, etc.)
 * @param {string} governmentIdNumber - Government ID number
 * @param {string} govermentIdDocumentUrl - Base64 encoded government ID
 */
export const register = asyncHandler(async (req, res, next) => {
  const {
    fullName,
    email,
    phone,
    password,
    governmentIdType,
    governmentIdNumber,
    govermentIdDocumentUrl,
  } = req.body;

  // 1. Validate required fields
  if (!fullName) {
    return next(new ErrorHandler("Full name is required", 400));
  }
  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }
  if (!phone) {
    return next(new ErrorHandler("Phone number is required", 400));
  }
  if (!password || password.length < 8) {
    return next(
      new ErrorHandler("Password must be at least 8 characters", 400),
    );
  }
  if (!governmentIdType) {
    return next(new ErrorHandler("Government ID type is required", 400));
  }
  if (!governmentIdNumber) {
    return next(new ErrorHandler("Government ID number is required", 400));
  }
  if (!govermentIdDocumentUrl) {
    return next(new ErrorHandler("Government ID document is required", 400));
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already registered", 409));
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // 5. Create user with pending status
  const newUser = new User({
    fullName,
    email,
    phone,
    password: hashedPassword,
    otp,
    otpExpiry,
    governmentIdType,
    governmentIdNumber,
    govermentIdDocumentUrl,
    accountStatus: "pending",
    isApproved: false,
    role: "voter",
    isEmailVerified: false,
  });

  await newUser.save();

  // 6. Send OTP email
  const sent = await sendOTP(email, otp);
  if (!sent) {
    return next(new ErrorHandler("Failed to send OTP email", 500));
  }

  // 7. Consistent response
  res.status(201).json({
    success: true,
    message:
      "Registration successful. OTP sent to your email. Your account is pending admin approval.",
    data: {
      userId: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      accountStatus: newUser.accountStatus,
    },
  });
});

/**
 * Verify email OTP
 * @route POST /api/auth/verify-otp
 * @access Public
 * @param {string} userId - User ID
 * @param {string} otp - One-time password
 */
export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { userId, otp } = req.body;

  // 1. Validate inputs
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }
  if (!otp) {
    return next(new ErrorHandler("OTP is required", 400));
  }

  // 2. Find user with OTP fields
  const user = await User.findById(userId).select("+otp +otpExpiry");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 3. Verify OTP value
  if (user.otp !== otp.toString()) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  // 4. Check OTP expiry
  if (new Date() > user.otpExpiry) {
    return next(new ErrorHandler("OTP has expired", 400));
  }

  // 5. Mark email as verified
  user.isEmailVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  // 6. Generate token
  const token = generateToken(user._id);

  // 7. Return based on account status
  if (user.accountStatus === "pending") {
    return res.status(200).json({
      success: true,
      message: "Email verified. Your account is pending admin approval.",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          accountStatus: "pending",
        },
      },
    });
  }

  if (user.accountStatus === "rejected") {
    return res.status(403).json({
      success: false,
      message: `Account registration rejected. Reason: ${user.rejectionReason || "Policy violation"}`,
    });
  }

  // Account is approved
  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: "approved",
      },
    },
  });
});

/**
 * Login user with email and password
 * @route POST /api/auth/login
 * @access Public
 * @param {string} email - User email
 * @param {string} password - User password
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validate inputs
  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }
  if (!password) {
    return next(new ErrorHandler("Password is required", 400));
  }

  // 2. Find user with password field
  const user = await User.findOne({ email }).select("+password");
  // console.log("USER FOUND ",user);
  
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // 3. Compare passwords
  
  console.log("Logginng", user);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  console.log("Logginng", user);
  // 4. Check email verification
  if (!user.isEmailVerified) {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTP(email, otp);

    return res.status(200).json({
      success: false,
      message: "Email not verified. OTP sent to your email.",
      data: {
        userId: user._id,
        email: user.email,
        needsVerification: true,
      },
    });
  }

  console.log("Logginng", user);
  // 5. Check account status
  if (user.accountStatus === "rejected") {
    return next(new ErrorHandler("Your account has been rejected", 403));
  }

  if (user.accountStatus === "pending") {
    return res.status(200).json({
      success: false,
      message: "Your account is pending admin approval",
      data: {
        userId: user._id,
        accountStatus: "pending",
      },
    });
  }
  console.log("Logginng",user);
  
  // 6. Generate token
  const token = generateToken(user._id);

  // 7. Consistent response
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    },
  });
});

/**
 * Get current authenticated user
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  // 1. Get user from request context
  
  const user = await User.findById(req.user.id);

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
      createdAt: user.createdAt,
    },
  });
});

/**
 * Resend OTP to user's email
 * @route POST /api/auth/resend-otp
 * @access Public
 * @param {string} userId - User ID
 */
export const resendOTP = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  // 1. Validate input
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  // 2. Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 3. Generate new OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  console.log(`[resendOTP] Generated OTP:`, otp);
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();
  console.log(`[resendOTP] OTP saved to user:`, user.otp);

  // 4. Send OTP
  const sent = await sendOTP(user.email, otp);
  console.log(`[resendOTP] OTP sent via email:`, otp, 'to', user.email, 'sent:', sent);
  if (!sent) {
    return next(new ErrorHandler("Failed to send OTP", 500));
  }

  // 5. Consistent response
  res.status(200).json({
    success: true,
    message: "OTP sent successfully to your email",
    data: {
      email: user.email,
      expiresIn: "10 minutes",
    },
  });
});

/**
 * Send OTP via SMS
 * @route POST /api/auth/send-otp-sms
 * @access Public
 * @param {string} userId - User ID
 * @note Phone number must be in E.164 format or have country code
 */
export const sendOTPviaSMS = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  // 1. Validate input
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  // 2. Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 3. Validate phone number
  if (!user.phone) {
    return next(new ErrorHandler("Phone number not found in profile", 400));
  }

  // 4. Format phone number
  let phoneNumber = user.phone;
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = `+91${phoneNumber}`; // Default to India
  }

  // 5. Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // 6. Send SMS
  const sent = await sendSMS(phoneNumber, otp);
  if (!sent) {
    return next(new ErrorHandler("Failed to send OTP via SMS", 500));
  }

  // 7. Consistent response
  res.status(200).json({
    success: true,
    message: "OTP sent to your phone number",
    data: {
      phone: phoneNumber,
      method: "sms",
      expiresIn: "15 minutes",
    },
  });
});

/**
 * Send OTP via dual channels (Email + SMS)
 * @route POST /api/auth/send-otp-dual
 * @access Public
 * @param {string} userId - User ID
 * @note For enhanced security - OTP sent to both email and SMS
 */
export const sendOTPDualChannel = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  // 1. Validate input
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  // 2. Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 3. Validate phone number
  if (!user.phone) {
    return next(new ErrorHandler("Phone number not found in profile", 400));
  }

  // 4. Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // 5. Format phone for SMS
  let phoneNumber = user.phone;
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = `+91${phoneNumber}`;
  }

  // 6. Send via both channels in parallel
  const emailPromise = sendOTP(user.email, otp);
  const smsPromise = sendSMS(phoneNumber, otp);

  const [emailSent, smsSent] = await Promise.all([emailPromise, smsPromise]);

  // 7. Handle results
  if (!emailSent && !smsSent) {
    return next(new ErrorHandler("Failed to send OTP via both channels", 500));
  }

  // 8. Consistent response
  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
    data: {
      channels: {
        email: emailSent ? "sent" : "failed",
        sms: smsSent ? "sent" : "failed",
      },
      note: "Check your email and/or phone for the OTP",
      expiresIn: "15 minutes",
    },
  });
});
