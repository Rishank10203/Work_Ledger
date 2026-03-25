import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresher-ledger';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin';
      existingAdmin.name = 'System Admin';
      await existingAdmin.save();
      console.log('Admin user updated successfully.');
    } else {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
