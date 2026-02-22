import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    voterId: {
      type: String,
      required: [true, "Please provide voter ID"],
      unique: true,
    },
    voterIdDocument: {
      type: String,
      required: true,
    },
    candidateName: {
      type: String,
      required: [true, "Please provide candidate name"],
      trim: true,
    },
    party: {
      type: String,
      required: [true, "Please provide party name"],
    },
    description: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CandidateProfile", candidateProfileSchema);
