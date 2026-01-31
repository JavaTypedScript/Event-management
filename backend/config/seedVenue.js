require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('../models/Resource'); // Ensure path matches your project structure

const resources = [
  {
    name: 'Main Auditorium',
    type: 'room',
    capacity: 500,
    bookings: []
  },
  {
    name: 'Seminar Hall A',
    type: 'room',
    capacity: 100,
    bookings: []
  },
  {
    name: 'Seminar Hall B',
    type: 'room',
    capacity: 100,
    bookings: []
  },
  {
    name: 'Computer Lab 1 (CSE)',
    type: 'room',
    capacity: 60,
    bookings: []
  },
  {
    name: 'Mechanical Workshop',
    type: 'room',
    capacity: 40,
    bookings: []
  },
  {
    name: 'Portable Projector #1',
    type: 'equipment',
    capacity: 1, // Represents availability count
    bookings: []
  },
  {
    name: 'PA Sound System (Portable)',
    type: 'equipment',
    capacity: 1,
    bookings: []
  }
];

const seedResources = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 MongoDB Connected...');

    // 2. Clear existing resources (Optional: strictly for development/reset)
    // Uncomment the line below if you want to wipe the table before seeding
    // await Resource.deleteMany({}); 
    // console.log('🗑️  Existing resources cleared.');

    // 3. Loop through and add resources if they don't exist
    for (const resource of resources) {
      // Check if resource exists by name
      const exists = await Resource.findOne({ name: resource.name });
      
      if (!exists) {
        await Resource.create(resource);
        console.log(`✅ Added: ${resource.name}`);
      } else {
        console.log(`⚠️  Skipped: ${resource.name} (Already exists)`);
      }
    }

    console.log('🎉 Resource Seeding Completed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedResources();