require('dotenv').config();
const mongoose = require('mongoose');
const Club = require('../models/Club');

const predefinedClubs = [
  { name: "Student Council", type: "administrative" },
  { name: "Robotics Club", type: "technical" },
  { name: "Google Developer Student Club (GDSC)", type: "technical" },
  { name: "Music Club", type: "cultural" },
  { name: "Dance Committee", type: "cultural" },
  { name: "NSS Unit", type: "administrative" },
  { name: "Sports Committee", type: "sports" },
  { name: "Entrepreneurship Cell", type: "technical" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Club.deleteMany({}); // Clear old data
    await Club.insertMany(predefinedClubs);
    console.log("✅ Clubs Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();