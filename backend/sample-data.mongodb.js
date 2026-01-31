// MongoDB Sample Data - Run in MongoDB Compass or mongosh

// Sample Candidates
db.candidates.insertMany([
  {
    name: "Alice Johnson",
    party: "Democratic Party",
    description:
      "Experienced leader focused on education and healthcare reform",
    image: "https://via.placeholder.com/200?text=Alice",
    voteCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Bob Smith",
    party: "Republican Party",
    description: "Economic reform and business development advocate",
    image: "https://via.placeholder.com/200?text=Bob",
    voteCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Carol White",
    party: "Independent",
    description: "Environmental sustainability and social justice champion",
    image: "https://via.placeholder.com/200?text=Carol",
    voteCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "David Brown",
    party: "Green Party",
    description: "Climate change action and renewable energy specialist",
    image: "https://via.placeholder.com/200?text=David",
    voteCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

console.log("Sample candidates inserted successfully!");
