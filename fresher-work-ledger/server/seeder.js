import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fresher-ledger');
    console.log('MongoDB Connected for Seeding...');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin'; // LOWERCASE to match strict RBAC
      await existingAdmin.save();
    } else {
      console.log('Creating Admin user...');
      await User.create({
        name: 'System Admin',
        password: adminPassword,
        role: 'admin' // LOWERCASE to match strict RBAC
      });
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
