import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Import Models
import User from "../src/models/User.js";
import Election from "../src/models/Election.js";
import CandidateProfile from "../src/models/CandidateProfile.js";
import Vote from "../src/models/Vote.js";
import AuditLog from "../src/models/AuditLog.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/e-voting";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

// Helper Functions
const generateVoterId = () => `VID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
const generateReceiptCode = () => `VOTE-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// ==================== SEED DATA ====================

// 1. VOTER DATA (10 Regular Users) - For Auth Routes
const voterUsers = [
  {
    fullName: "Raj Kumar Singh",
    email: "raj.kumar@evoting.com",
    phone: "9876543210",
    password: "Password123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "123456789012",
    govermentIdDocumentUrl: "https://example.com/doc1.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Priya Sharma",
    email: "priya.sharma@evoting.com",
    phone: "9876543211",
    password: "Password123!",
    governmentIdType: "pan",
    governmentIdNumber: "AABCD1234E",
    govermentIdDocumentUrl: "https://example.com/doc2.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Amit Patel",
    email: "amit.patel@evoting.com",
    phone: "9876543212",
    password: "Password123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "234567890123",
    govermentIdDocumentUrl: "https://example.com/doc3.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Anjali Gupta",
    email: "anjali.gupta@evoting.com",
    phone: "9876543213",
    password: "Password123!",
    governmentIdType: "other",
    governmentIdNumber: "DL-12345678",
    govermentIdDocumentUrl: "https://example.com/doc4.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Rahul Verma",
    email: "rahul.verma@evoting.com",
    phone: "9876543214",
    password: "Password123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "345678901234",
    govermentIdDocumentUrl: "https://example.com/doc5.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Sneha Das",
    email: "sneha.das@evoting.com",
    phone: "9876543215",
    password: "Password123!",
    governmentIdType: "pan",
    governmentIdNumber: "BXYPM5678F",
    govermentIdDocumentUrl: "https://example.com/doc6.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Vikram Singh",
    email: "vikram.singh@evoting.com",
    phone: "9876543216",
    password: "Password123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "456789012345",
    govermentIdDocumentUrl: "https://example.com/doc7.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Kavya Nair",
    email: "kavya.nair@evoting.com",
    phone: "9876543217",
    password: "Password123!",
    governmentIdType: "other",
    governmentIdNumber: "HR-87654321",
    govermentIdDocumentUrl: "https://example.com/doc8.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Nikhil Reddy",
    email: "nikhil.reddy@evoting.com",
    phone: "9876543218",
    password: "Password123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "567890123456",
    govermentIdDocumentUrl: "https://example.com/doc9.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Divya Rao",
    email: "divya.rao@evoting.com",
    phone: "9876543219",
    password: "Password123!",
    governmentIdType: "pan",
    governmentIdNumber: "CZBDP9012G",
    govermentIdDocumentUrl: "https://example.com/doc10.pdf",
    role: "voter",
    isApproved: true,
    accountStatus: "approved",
  },
];

// 2. ADMIN DATA (10 Admin Users) - For Admin Routes
const adminUsers = [
  {
    fullName: "Admin One",
    email: "admin1@evoting.com",
    phone: "8800000001",
    password: "AdminPass123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "111111111111",
    govermentIdDocumentUrl: "https://example.com/admin1.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Two",
    email: "admin2@evoting.com",
    phone: "8800000002",
    password: "AdminPass123!",
    governmentIdType: "pan",
    governmentIdNumber: "ADMAA0001A",
    govermentIdDocumentUrl: "https://example.com/admin2.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Three",
    email: "admin3@evoting.com",
    phone: "8800000003",
    password: "AdminPass123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "222222222222",
    govermentIdDocumentUrl: "https://example.com/admin3.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Four",
    email: "admin4@evoting.com",
    phone: "8800000004",
    password: "AdminPass123!",
    governmentIdType: "other",
    governmentIdNumber: "DL-99999999",
    govermentIdDocumentUrl: "https://example.com/admin4.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Five",
    email: "admin5@evoting.com",
    phone: "8800000005",
    password: "AdminPass123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "333333333333",
    govermentIdDocumentUrl: "https://example.com/admin5.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Six",
    email: "admin6@evoting.com",
    phone: "8800000006",
    password: "AdminPass123!",
    governmentIdType: "pan",
    governmentIdNumber: "ADMBB0002B",
    govermentIdDocumentUrl: "https://example.com/admin6.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Seven",
    email: "admin7@evoting.com",
    phone: "8800000007",
    password: "AdminPass123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "444444444444",
    govermentIdDocumentUrl: "https://example.com/admin7.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Eight",
    email: "admin8@evoting.com",
    phone: "8800000008",
    password: "AdminPass123!",
    governmentIdType: "other",
    governmentIdNumber: "HR-88888888",
    govermentIdDocumentUrl: "https://example.com/admin8.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Nine",
    email: "admin9@evoting.com",
    phone: "8800000009",
    password: "AdminPass123!",
    governmentIdType: "aadhar",
    governmentIdNumber: "555555555555",
    govermentIdDocumentUrl: "https://example.com/admin9.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
  {
    fullName: "Admin Ten",
    email: "admin10@evoting.com",
    phone: "8800000010",
    password: "AdminPass123!",
    governmentIdType: "pan",
    governmentIdNumber: "ADMCC0003C",
    govermentIdDocumentUrl: "https://example.com/admin10.pdf",
    role: "admin",
    isApproved: true,
    accountStatus: "approved",
  },
];

// 3. ELECTION DATA (10 Elections) - For Election Routes
const electionsData = [
  {
    title: "Presidential Election 2026",
    description: "National presidential election to elect the next president",
    startDate: new Date("2026-04-15"),
    endDate: new Date("2026-04-30"),
    isActive: false,
  },
  {
    title: "Governor Election 2026",
    description: "State governor election for 2026",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-15"),
    isActive: true,
  },
  {
    title: "Senate District A Election",
    description: "Senate election for district A",
    startDate: new Date("2026-05-20"),
    endDate: new Date("2026-06-05"),
    isActive: false,
  },
  {
    title: "City Mayor Election 2026",
    description: "Municipal mayor election for the city",
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-06-25"),
    isActive: true,
  },
  {
    title: "Local Council Ward 5",
    description: "Local council elections for Ward 5",
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-07-15"),
    isActive: false,
  },
  {
    title: "School Board District 3",
    description: "School board election for district 3",
    startDate: new Date("2026-07-20"),
    endDate: new Date("2026-08-05"),
    isActive: true,
  },
  {
    title: "County Supervisor Election",
    description: "County supervisor election for 2026",
    startDate: new Date("2026-08-10"),
    endDate: new Date("2026-08-25"),
    isActive: false,
  },
  {
    title: "State Proposition Vote 2026",
    description: "Special referendum on state proposition",
    startDate: new Date("2026-09-01"),
    endDate: new Date("2026-09-15"),
    isActive: true,
  },
  {
    title: "Regional Board of Education",
    description: "Regional education board election",
    startDate: new Date("2026-09-20"),
    endDate: new Date("2026-10-05"),
    isActive: false,
  },
  {
    title: "Infrastructure Bond Measure",
    description: "Ballot measure for infrastructure funding",
    startDate: new Date("2026-10-10"),
    endDate: new Date("2026-10-25"),
    isActive: true,
  },
];

// 4. CANDIDATE PROFILE DATA (10 Candidate Profiles) - For Candidate Profile Routes
const candidateData = (users) => [
  {
    userId: users[0]._id,
    candidateName: "Candidate Name 1",
    party: "Democratic Party",
    description: "Experienced leader with 20 years in public service",
    status: "approved",
  },
  {
    userId: users[1]._id,
    candidateName: "Candidate Name 2",
    party: "Republican Party",
    description: "Business executive focused on economic growth",
    status: "approved",
  },
  {
    userId: users[2]._id,
    candidateName: "Candidate Name 3",
    party: "Independent",
    description: "Community activist dedicated to social welfare",
    status: "approved",
  },
  {
    userId: users[3]._id,
    candidateName: "Candidate Name 4",
    party: "Green Party",
    description: "Environmental advocate with passion for sustainability",
    status: "pending",
  },
  {
    userId: users[4]._id,
    candidateName: "Candidate Name 5",
    party: "Democratic Party",
    description: "Healthcare professional committed to policy reform",
    status: "approved",
  },
  {
    userId: users[5]._id,
    candidateName: "Candidate Name 6",
    party: "Republican Party",
    description: "Military veteran with strong defense background",
    status: "approved",
  },
  {
    userId: users[6]._id,
    candidateName: "Candidate Name 7",
    party: "Independent",
    description: "Technology innovator promoting digital transformation",
    status: "approved",
  },
  {
    userId: users[7]._id,
    candidateName: "Candidate Name 8",
    party: "Progressive Party",
    description: "Civil rights advocate fighting for equality",
    status: "pending",
  },
  {
    userId: users[8]._id,
    candidateName: "Candidate Name 9",
    party: "Labor Party",
    description: "Union leader protecting worker rights",
    status: "approved",
  },
  {
    userId: users[9]._id,
    candidateName: "Candidate Name 10",
    party: "Democratic Party",
    description: "Education specialist improving school systems",
    status: "approved",
  },
];

// ==================== SEEDING FUNCTIONS ====================

const seedUsers = async () => {
  try {
    console.log("\n📝 Seeding Users...");

    // Delete existing users
    await User.deleteMany({});

    // Hash passwords
    const votersWithHashedPasswords = await Promise.all(
      voterUsers.map(async (voter) => ({
        ...voter,
        password: await hashPassword(voter.password),
        voterId: generateVoterId(),
      }))
    );

    const adminsWithHashedPasswords = await Promise.all(
      adminUsers.map(async (admin) => ({
        ...admin,
        password: await hashPassword(admin.password),
        voterId: generateVoterId(),
      }))
    );

    // Create users
    const voters = await User.insertMany(votersWithHashedPasswords);
    const admins = await User.insertMany(adminsWithHashedPasswords);

    console.log(`✅ Created ${voters.length} voter users`);
    console.log(`✅ Created ${admins.length} admin users`);

    return { voters, admins };
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    throw error;
  }
};

const seedElections = async (adminUser) => {
  try {
    console.log("\n📋 Seeding Elections...");

    // Delete existing elections
    await Election.deleteMany({});

    const electionsWithAdmin = electionsData.map((election) => ({
      ...election,
      createdBy: adminUser._id,
    }));

    const elections = await Election.insertMany(electionsWithAdmin);
    console.log(`✅ Created ${elections.length} elections`);

    return elections;
  } catch (error) {
    console.error("❌ Error seeding elections:", error.message);
    throw error;
  }
};

const seedCandidateProfiles = async (voterUsers) => {
  try {
    console.log("\n🎭 Seeding Candidate Profiles...");

    // Delete existing profiles
    await CandidateProfile.deleteMany({});

    const candidates = candidateData(voterUsers);

    const candidatesWithVoterId = candidates.map((candidate) => ({
      ...candidate,
      voterId: generateVoterId(),
      voterIdDocument: "https://example.com/voter-doc.pdf",
    }));

    const profiles = await CandidateProfile.insertMany(candidatesWithVoterId);
    console.log(`✅ Created ${profiles.length} candidate profiles`);

    return profiles;
  } catch (error) {
    console.error("❌ Error seeding candidate profiles:", error.message);
    throw error;
  }
};

const seedElectionsWithCandidates = async (elections, candidateProfiles) => {
  try {
    console.log("\n🗳️ Linking Candidates to Elections...");

    // Distribute candidates across elections (roughly 3-5 per election)
    for (let i = 0; i < elections.length; i++) {
      const startIdx = (i * 3) % candidateProfiles.length;
      const count = 3 + (i % 2);
      const electionCandidates = [];

      for (let j = 0; j < count; j++) {
        const idx = (startIdx + j) % candidateProfiles.length;
        electionCandidates.push(candidateProfiles[idx]._id);
      }

      elections[i].candidates = electionCandidates;
      await elections[i].save();
    }

    console.log(`✅ Linked candidates to elections`);
  } catch (error) {
    console.error("❌ Error linking candidates to elections:", error.message);
    throw error;
  }
};

const seedVotes = async (voterUsers, elections, candidateProfiles) => {
  try {
    console.log("\n🗳️ Seeding Votes...");

    // Delete existing votes
    await Vote.deleteMany({});

    const votes = [];
    let voteCount = 0;

    // Create votes for each voter in different elections
    for (let i = 0; i < voterUsers.length; i++) {
      const user = voterUsers[i];
      const electionIdx = i % elections.length;
      const election = elections[electionIdx];
      const candidateIdx = (i * 3) % candidateProfiles.length;
      const candidate = candidateProfiles[candidateIdx];

      // Encrypt candidate ID (simple hash for demo)
      const encryptedCandidate = crypto
        .createHash("sha256")
        .update(candidate._id.toString())
        .digest("hex");

      // Generate voter hash
      const voterHash = crypto
        .createHash("sha256")
        .update(user._id.toString() + election._id.toString())
        .digest("hex");

      // Generate checksum
      const checksum = crypto
        .createHash("sha256")
        .update(encryptedCandidate + voterHash)
        .digest("hex");

      votes.push({
        election: election._id,
        user: user._id,
        encryptedCandidate,
        voterHash,
        checksum,
        receiptCode: generateReceiptCode(),
        isEncrypted: true,
        ipAddress: `192.168.1.${100 + i}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      });

      voteCount++;
    }

    // Create additional votes for variety (10 more)
    for (let i = 0; i < 10; i++) {
      const userIdx = i % voterUsers.length;
      const electionIdx = (i + 1) % elections.length;
      const candidateIdx = (i * 2) % candidateProfiles.length;

      const user = voterUsers[userIdx];
      const election = elections[electionIdx];
      const candidate = candidateProfiles[candidateIdx];

      const encryptedCandidate = crypto
        .createHash("sha256")
        .update(candidate._id.toString())
        .digest("hex");

      const voterHash = crypto
        .createHash("sha256")
        .update(user._id.toString() + election._id.toString() + i)
        .digest("hex");

      const checksum = crypto
        .createHash("sha256")
        .update(encryptedCandidate + voterHash)
        .digest("hex");

      votes.push({
        election: election._id,
        user: user._id,
        encryptedCandidate,
        voterHash,
        checksum,
        receiptCode: generateReceiptCode(),
        isEncrypted: true,
        ipAddress: `192.168.2.${100 + i}`,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
      });

      voteCount++;
    }

    const createdVotes = await Vote.insertMany(votes);
    console.log(`✅ Created ${createdVotes.length} votes`);

    return createdVotes;
  } catch (error) {
    console.error("❌ Error seeding votes:", error.message);
    throw error;
  }
};

const seedAuditLogs = async (admins, voterUsers) => {
  try {
    console.log("\n📊 Seeding Audit Logs...");

    // Delete existing audit logs
    await AuditLog.deleteMany({});

    const logs = [];

    // Create various audit log entries
    const actions = [
      "user_registered",
      "user_approved",
      "candidate_profile_submitted",
      "candidate_profile_approved",
      "election_created",
      "election_started",
      "election_stopped",
      "vote_cast",
      "results_viewed",
    ];

    const adminUser = admins[0];

    for (let i = 0; i < 10; i++) {
      const action = actions[i % actions.length];
      const targetUser = voterUsers[i % voterUsers.length];

      logs.push({
        action,
        user: admins[i % admins.length]._id,
        targetUser: targetUser._id,
        description: `User ${targetUser.fullName} - Action: ${action}`,
        ipAddress: `192.168.1.${50 + i}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0)",
        timestamp: new Date(Date.now() - i * 86400000), // Spread over past days
      });
    }

    // Create admin-specific logs
    for (let i = 0; i < 5; i++) {
      logs.push({
        action: "admin_login",
        user: admins[i]._id,
        description: `Admin ${admins[i].fullName} logged in`,
        ipAddress: `192.168.1.${200 + i}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0)",
        timestamp: new Date(),
      });
    }

    const createdLogs = await AuditLog.insertMany(logs);
    console.log(`✅ Created ${createdLogs.length} audit logs`);

    return createdLogs;
  } catch (error) {
    console.error("❌ Error seeding audit logs:", error.message);
    throw error;
  }
};

// ==================== MAIN SEEDING FUNCTION ====================

const seedDatabase = async () => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🌱 STARTING COMPLETE DATABASE SEEDING");
    console.log("=".repeat(60));

    // 1. Seed Users (Auth Routes)
    const { voters, admins } = await seedUsers();

    // 2. Seed Elections (Election Routes)
    const elections = await seedElections(admins[0]);

    // 3. Seed Candidate Profiles (Candidate Profile Routes)
    const candidateProfiles = await seedCandidateProfiles(voters);

    // 4. Link Candidates to Elections
    await seedElectionsWithCandidates(elections, candidateProfiles);

    // 5. Seed Votes (Voting Routes)
    const votes = await seedVotes(voters, elections, candidateProfiles);

    // 6. Seed Audit Logs (Admin Routes)
    const auditLogs = await seedAuditLogs(admins, voters);

    // Print Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ SEEDING COMPLETE - SUMMARY");
    console.log("=".repeat(60));
    console.log(`📊 Voter Users:          ${voters.length}`);
    console.log(`👨‍💼 Admin Users:          ${admins.length}`);
    console.log(`🗳️ Elections:             ${elections.length}`);
    console.log(`🎭 Candidate Profiles:   ${candidateProfiles.length}`);
    console.log(`🗳️ Votes:                ${votes.length}`);
    console.log(`📝 Audit Logs:           ${auditLogs.length}`);
    console.log("=".repeat(60));

    // Print Sample Data
    console.log("\n📋 SAMPLE DATA FOR TESTING:");
    console.log("=".repeat(60));
    console.log("\n🔑 VOTER LOGIN CREDENTIALS:");
    console.log(`   Email: ${voters[0].email}`);
    console.log(`   Password: Password123!`);
    console.log("\n🔐 ADMIN LOGIN CREDENTIALS:");
    console.log(`   Email: ${admins[0].email}`);
    console.log(`   Password: AdminPass123!`);
    console.log("\n📊 SAMPLE ELECTION:");
    console.log(`   Title: ${elections[0].title}`);
    console.log(`   Status: ${elections[0].isActive ? "Active" : "Inactive"}`);
    console.log(`   Candidates: ${elections[0].candidates.length}`);
    console.log("\n🎭 SAMPLE CANDIDATE:");
    console.log(`   Name: ${candidateProfiles[0].candidateName}`);
    console.log(`   Party: ${candidateProfiles[0].party}`);
    console.log(`   Status: ${candidateProfiles[0].status}`);
    console.log("\n" + "=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

// ==================== RUN SEEDING ====================

connectDB().then(() => seedDatabase());
