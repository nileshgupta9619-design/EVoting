import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
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
    image: {
      type: String,
      default: null,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Candidate", candidateSchema);
