import nodemailer from "nodemailer";

// ✅ FIX: Create a function to get transporter with fresh env variables
const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendOTP = async (email, otp) => {
  try {
    console.log("Env Check:", {
      EMAIL_USER: process.env.EMAIL_USER || "NOT SET",
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "SET ✓" : "NOT SET ❌",
    });

    // Debug: Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("❌ EMAIL_USER or EMAIL_PASSWORD not set in .env file");
      return false;
    }

    console.log(`📧 Sending OTP to ${email}...`);

    // ✅ FIX: Get fresh transporter each time
    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "E-Voting OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your OTP for E-Voting verification is:</p>
          <h1 style="color: #007bff; letter-spacing: 2px;">${otp}</h1>
          <p style="color: #666;">This OTP will expire in 15 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    console.error("Full error:", error);
    return false;
  }
};

export default getTransporter;
