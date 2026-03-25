import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const testUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresher-ledger';
console.log('Testing connection to:', testUri.replace(/:[^:@/]+@/, ':****@').replace(/:[^:@/]+@/, ':****@')); // Mask password

mongoose.connect(testUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
