import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return error;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a unique receipt code for vote verification
 * Format: EVOTE-YYYYMMDD-XXXXXX (12 characters)
 * Example: EVOTE-20260220-A1B2C3
 * @returns {string} Receipt code
 */
export const generateReceiptCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EVOTE-${date}-${randomStr}`;
};

/**
 * Generate OTP with expiry information
 * @returns {object} Object with otp and expiry timestamp
 */
export const generateOTPWithExpiry = (expiryMinutes = 15) => {
  return {
    otp: generateOTP(),
    expiryTime: Date.now() + expiryMinutes * 60 * 1000,
  };
};
