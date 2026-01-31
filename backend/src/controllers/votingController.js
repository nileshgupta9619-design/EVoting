import Candidate from "../models/Candidate.js";
import User from "../models/User.js";

export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCandidate = async (req, res) => {
  try {
    const { name, party, description, image } = req.body;

    const candidate = new Candidate({
      name,
      party,
      description,
      image,
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const vote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.hasVoted) {
      return res
        .status(400)
        .json({ success: false, message: "You have already voted" });
    }

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    user.hasVoted = true;
    user.votedFor = candidateId;
    await user.save();

    candidate.voteCount += 1;
    await candidate.save();

    res.status(200).json({
      success: true,
      message: "Vote cast successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResults = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    const totalVotes = candidates.reduce(
      (acc, cand) => acc + cand.voteCount,
      0,
    );

    const results = candidates.map((candidate) => ({
      id: candidate._id,
      name: candidate.name,
      party: candidate.party,
      voteCount: candidate.voteCount,
      percentage:
        totalVotes > 0
          ? ((candidate.voteCount / totalVotes) * 100).toFixed(2)
          : 0,
    }));

    res.status(200).json({
      success: true,
      totalVotes,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
