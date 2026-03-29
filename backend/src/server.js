import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import votingRoutes from "./routes/votingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import candidateProfileRoutes from "./routes/candidateProfileRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import { ErrorHandler } from "./utils/errorHandler.js";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
// registerUser();
    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

// API Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Voting Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/voting", votingRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/candidate-profiles", candidateProfileRoutes);
app.use("/api/elections", electionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("✗ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("✗ Uncaught Exception:", err);
  server.close(() => process.exit(1));
});
import bcryptjs from "bcryptjs";
// Example register function
async function registerUser() {
  try {
    const   password  = 'Password@123';
    console.log(password);
    
    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Save to DB (example)
    const user = {
      
      password: hashedPassword,
    };

    console.log(user); // replace with DB save

    
  } catch (err) {
  }
}
export default app;
