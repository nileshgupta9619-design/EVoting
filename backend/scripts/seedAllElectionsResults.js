/**
 * Seed All Elections Results Data
 * Generates 10 dummy election records with candidates and vote counts
 * Run: node seedAllElectionsResults.js
 */

import mongoose from "mongoose";
import Election from "../src/models/Election.js";
import CandidateProfile from "../src/models/CandidateProfile.js";
import User from "../src/models/User.js";
import { errorHandler } from "../src/utils/errorHandler.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/evoting";

const dummyElections = [
  {
    title: "Presidential Election 2026",
    description: "National presidential election for 2026",
    isActive: false,
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-29"),
    candidates: [
      {
        candidateName: "John Smith",
        party: "Democratic Party",
        voteCount: 450,
        description: "Experienced leader with focus on economy",
      },
      {
        candidateName: "Sarah Johnson",
        party: "Republican Party",
        voteCount: 380,
        description: "Healthcare advocate and reformer",
      },
      {
        candidateName: "Michael Chen",
        party: "Independent",
        voteCount: 220,
        description: "Tech entrepreneur and innovator",
      },
      {
        candidateName: "Emma Wilson",
        party: "Green Party",
        voteCount: 150,
        description: "Environmental policy expert",
      },
      {
        candidateName: "David Martinez",
        party: "Labor Party",
        voteCount: 200,
        description: "Workers' rights champion",
      },
    ],
  },
  {
    title: "Governor Election 2026",
    description: "State gubernatorial election",
    isActive: true,
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-04-15"),
    candidates: [
      {
        candidateName: "Robert Anderson",
        party: "Democratic Party",
        voteCount: 520,
        description: "Education reform advocate",
      },
      {
        candidateName: "Lisa Thompson",
        party: "Republican Party",
        voteCount: 480,
        description: "Tax reduction specialist",
      },
      {
        candidateName: "James Park",
        party: "Independent",
        voteCount: 180,
        description: "Local community leader",
      },
    ],
  },
  {
    title: "Senate Election District A",
    description: "Senate seat election for District A",
    isActive: false,
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-03-20"),
    candidates: [
      {
        candidateName: "Alice Brown",
        party: "Democratic Party",
        voteCount: 340,
        description: "Environmental advocate",
      },
      {
        candidateName: "Thomas Davis",
        party: "Republican Party",
        voteCount: 360,
        description: "Budget hawk",
      },
      {
        candidateName: "Nancy Patel",
        party: "Green Party",
        voteCount: 95,
        description: "Climate change expert",
      },
    ],
  },
  {
    title: "City Mayor Election 2026",
    description: "Election for city mayor position",
    isActive: false,
    startDate: new Date("2026-02-10"),
    endDate: new Date("2026-03-10"),
    candidates: [
      {
        candidateName: "Christopher Lee",
        party: "Democratic Party",
        voteCount: 280,
        description: "Urban development expert",
      },
      {
        candidateName: "Victoria White",
        party: "Republican Party",
        voteCount: 310,
        description: "Small business owner",
      },
      {
        candidateName: "Kevin Jackson",
        party: "Independent",
        voteCount: 175,
        description: "Community activist",
      },
      {
        candidateName: "Rachel Green",
        party: "Green Party",
        voteCount: 85,
        description: "Sustainability director",
      },
    ],
  },
  {
    title: "Local Council Election Ward 5",
    description: "Ward 5 local council representative election",
    isActive: true,
    startDate: new Date("2026-03-10"),
    endDate: new Date("2026-04-10"),
    candidates: [
      {
        candidateName: "Mark O'Connor",
        party: "Democratic Party",
        voteCount: 210,
        description: "Neighborhood improvement advocate",
      },
      {
        candidateName: "Jennifer Russell",
        party: "Republican Party",
        voteCount: 195,
        description: "Infrastructure specialist",
      },
      {
        candidateName: "Paul Robinson",
        party: "Independent",
        voteCount: 120,
        description: "Local business leader",
      },
      {
        candidateName: "Susan Hayes",
        party: "Green Party",
        voteCount: 72,
        description: "Parks and recreation champion",
      },
      {
        candidateName: "Daniel Kim",
        party: "Labor Party",
        voteCount: 98,
        description: "Worker advocate",
      },
    ],
  },
  {
    title: "School Board Election District 3",
    description: "School board election for District 3",
    isActive: false,
    startDate: new Date("2025-12-01"),
    endDate: new Date("2026-01-30"),
    candidates: [
      {
        candidateName: "Dr. Patricia Adams",
        party: "Independent",
        voteCount: 420,
        description: "Education reformer with PhD",
      },
      {
        candidateName: "Michael Foster",
        party: "Democratic Party",
        voteCount: 390,
        description: "Teacher advocate",
      },
      {
        candidateName: "Elizabeth Scott",
        party: "Republican Party",
        voteCount: 350,
        description: "Finance management expert",
      },
      {
        candidateName: "James Murphy",
        party: "Independent",
        voteCount: 180,
        description: "Parent representative",
      },
    ],
  },
  {
    title: "County Supervisor Election",
    description: "County supervisor seat election",
    isActive: true,
    startDate: new Date("2026-03-20"),
    endDate: new Date("2026-05-20"),
    candidates: [
      {
        candidateName: "George Taylor",
        party: "Republican Party",
        voteCount: 410,
        description: "Conservative budget manager",
      },
      {
        candidateName: "Margaret Bell",
        party: "Democratic Party",
        voteCount: 445,
        description: "Progressive policy maker",
      },
      {
        candidateName: "Richard Evans",
        party: "Independent",
        voteCount: 165,
        description: "Rural community representative",
      },
    ],
  },
  {
    title: "State Proposition Vote 2026",
    description: "Referendum on state educational funding",
    isActive: false,
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-02-28"),
    candidates: [
      {
        candidateName: "Support Funding Increase",
        party: "Pro-Proposition",
        voteCount: 520,
        description: "Increase school funding by 15%",
      },
      {
        candidateName: "Oppose Funding Increase",
        party: "Anti-Proposition",
        voteCount: 380,
        description: "Maintain current funding levels",
      },
    ],
  },
  {
    title: "Regional Board of Education",
    description: "Regional education board member election",
    isActive: false,
    startDate: new Date("2026-02-15"),
    endDate: new Date("2026-03-15"),
    candidates: [
      {
        candidateName: "Hugh Mitchell",
        party: "Democratic Party",
        voteCount: 285,
        description: "Public school administrator",
      },
      {
        candidateName: "Catherine Newman",
        party: "Republican Party",
        voteCount: 310,
        description: "Charter school advocate",
      },
      {
        candidateName: "Oliver Thompson",
        party: "Independent",
        voteCount: 145,
        description: "Educator with 20 years experience",
      },
      {
        candidateName: "Sophia Davis",
        party: "Independent",
        voteCount: 95,
        description: "Parent organization leader",
      },
    ],
  },
  {
    title: "Ballot Measure A - Infrastructure Bond",
    description: "Vote on $500M infrastructure improvement bond",
    isActive: true,
    startDate: new Date("2026-03-25"),
    endDate: new Date("2026-06-25"),
    candidates: [
      {
        candidateName: "Yes - Support Bond",
        party: "Infrastructure Coalition",
        voteCount: 580,
        description: "Approve $500M for roads and bridges",
      },
      {
        candidateName: "No - Reject Bond",
        party: "Fiscal Conservative Coalition",
        voteCount: 420,
        description: "Reject bond measure",
      },
    ],
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("\n🗳️  Starting to seed election data...\n");

    // Get or create an admin user for createdBy
    let adminUser = await User.findOne({ email: "admin@evoting.com" });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: "Admin User",
        email: "admin@evoting.com",
        password: "hashedPassword123", // In production, this would be hashed
        role: "admin",
        isApproved: true,
      });
      console.log("✓ Created admin user");
    }

    // Track statistics
    let electionsCreated = 0;
    let candidatesCreated = 0;

    for (let i = 0; i < dummyElections.length; i++) {
      const electionData = dummyElections[i];

      try {
        // Check if election already exists
        let election = await Election.findOne({ title: electionData.title });

        if (!election) {
          // Create election
          election = await Election.create({
            title: electionData.title,
            description: electionData.description,
            isActive: electionData.isActive,
            startDate: electionData.startDate,
            endDate: electionData.endDate,
            createdBy: adminUser._id,
          });
          electionsCreated++;
          console.log(`✓ Election ${i + 1}/10: "${election.title}"`);
        } else {
          console.log(`⊘ Election already exists: "${election.title}"`);
        }

        // Create candidates for this election
        for (const candidateData of electionData.candidates) {
          try {
            const existingCandidate = await CandidateProfile.findOne({
              election: election._id,
              candidateName: candidateData.candidateName,
            });

            if (!existingCandidate) {
              const candidate = await CandidateProfile.create({
                election: election._id,
                candidateName: candidateData.candidateName,
                party: candidateData.party,
                description: candidateData.description,
                voteCount: candidateData.voteCount,
                status: "approved",
                profileImage: `https://ui-avatars.com/api/?name=${candidateData.candidateName.replace(/ /g, "+")}&background=random`,
              });
              candidatesCreated++;
              console.log(
                `  └─ Added candidate: ${candidate.candidateName} (${candidate.voteCount} votes)`,
              );
            }
          } catch (error) {
            console.error(`  └─ Error creating candidate: ${error.message}`);
          }
        }

        console.log("");
      } catch (error) {
        console.error(`✗ Error creating election: ${error.message}\n`);
      }
    }

    console.log("\n✅ Seeding Complete!");
    console.log(`📊 Statistics:`);
    console.log(`   Elections Created: ${electionsCreated}`);
    console.log(`   Candidates Created: ${candidatesCreated}`);
    console.log(
      `   Total Elections (including existing): ${dummyElections.length}`,
    );
  } catch (error) {
    console.error("✗ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✓ Database connection closed\n");
  }
};

// Run seeding
seedDatabase();
