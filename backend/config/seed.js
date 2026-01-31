require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path to your User model

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // 1. Check if an admin already exists to avoid duplicates
    const existingAdmin = await User.findOne({ email: 'admin@campus.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit();
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Default password

    // 3. Create the Admin User
    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@campus.com',
      password: hashedPassword,
      department: 'Admin',
      year: 'Staff',
      role: 'admin' // <--- The Magic Key
    });

    await adminUser.save();
    console.log('✅ Super Admin Created Successfully!');
    console.log('Email: admin@campus.com');
    console.log('Pass: admin123');
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();