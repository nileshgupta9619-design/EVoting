import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/helpers.js";

// Admin login
export const adminLogin = async (req, res) => {
  try {
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
    const users = await User.find({role:{$ne:"admin"}}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      length:users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

