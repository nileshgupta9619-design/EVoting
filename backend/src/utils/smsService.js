/**
 * SMS Service for sending OTP via SMS
 * Uses Twilio API for SMS delivery
 * Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env
 */

// Mock SMS implementation (for development/testing)
// Replace with actual Twilio integration in production

const isProductionSMS = process.env.SMS_PROVIDER === "twilio";

// Twilio integration (optional - for production)
let twilio;
if (isProductionSMS) {
  try {
    twilio = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  } catch (error) {
    console.warn("Twilio not configured. SMS will be logged only.");
  }
}

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number in E.164 format (e.g., +911234567890)
 * @param {string} otp - One-time password
 * @returns {Promise<boolean>} - Success status
 */
export const sendSMS = async (phone, otp) => {
  try {
    // Validate phone number format
    if (!phone || !phone.startsWith("+")) {
      console.warn(
        `Invalid phone format: ${phone}. Expected E.164 format like +911234567890`,
      );
      return false;
    }

    if (!otp) {
      console.error("OTP is required");
      return false;
    }

    console.log(`📱 Sending SMS to ${phone}...`);

    if (isProductionSMS && twilio) {
      // Production: Use Twilio API
      const message = await twilio.messages.create({
        body: `Your E-Voting OTP is: ${otp}. This code will expire in 15 minutes. Do not share this code with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log(`✅ SMS sent successfully. Message SID: ${message.sid}`);
      return true;
    } else {
      // Development: Log SMS (simulate sending)
      console.log(`📱 [SMS SIMULATION] Phone: ${phone}`);
      console.log(`📱 [SMS SIMULATION] OTP: ${otp}`);
      console.log(
        `📱 [SMS SIMULATION] Message: Your E-Voting OTP is: ${otp}. This code will expire in 15 minutes.`,
      );
      console.warn(
        "⚠️  SMS not actually sent (development mode). Set SMS_PROVIDER=twilio in .env for production.",
      );
      return true; // Return true in development mode for testing
    }
  } catch (error) {
    console.error("❌ SMS sending error:", error.message);
    return false;
  }
};

/**
 * Send SMS with multiple attempts and retry logic
 * @param {string} phone - Phone number
 * @param {string} otp - One-time password
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<boolean>}
 */
export const sendSMSWithRetry = async (phone, otp, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendSMS(phone, otp);
      if (success) {
        return true;
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
      }
    }
  }
  return false;
};

/**
 * Send verification SMS to multiple phone numbers
 * @param {string[]} phones - Array of phone numbers
 * @param {string} otp - One-time password
 * @returns {Promise<object>} - Results object with successes and failures
 */
export const sendSMSBulk = async (phones, otp) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const phone of phones) {
    try {
      const success = await sendSMS(phone, otp);
      if (success) {
        results.successful.push(phone);
      } else {
        results.failed.push(phone);
      }
    } catch (error) {
      results.failed.push(phone);
    }
  }

  return results;
};
