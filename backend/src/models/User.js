import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    hasVoted: {
      type: Boolean,
      default: false,
    },
    votedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },
    role: {
      type: String,
      enum: ["voter", "admin"],
      default: "voter",
    },
    voterId: {
      type: String,
      default: null,
    },
    voterIdDocument: {
      type: String,
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    governmentIdType: {
      type: String,
      enum: ["aadhar", "pan", "other"],
      required: [true, "Government ID type is required"],
    },
    governmentIdNumber: {
      type: String,
      required: [true, "Government ID number is required"],
    },
    govermentIdDocumentUrl: {
      type: String,
      required: [true, "Government ID document is required"],
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
    allowedElections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Election",
      },
    ],
    electionVotes: [
      {
        electionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Election",
        },
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
