import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Encrypted candidate reference so raw candidate id isn't exposed
    encryptedCandidate: {
      type: String,
      required: true,
    },
    // Anonymous voter token/hash (not user id)
    voterHash: {
      type: String,
      required: true,
    },
    checksum: {
      type: String,
      required: true,
    },
    // Receipt code for vote verification
    receiptCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    // Whether vote was encrypted before storage
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    // IP address of voter (for audit trail)
    ipAddress: {
      type: String,
      default: null,
    },
    // User agent/browser info (for audit trail)
    userAgent: {
      type: String,
      default: null,
    },
    // Vote submission timestamp
    votedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Vote", voteSchema);
