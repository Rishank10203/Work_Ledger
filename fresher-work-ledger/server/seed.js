import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('--- START EMERGENCY SEEDING ---');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fresher-ledger');
        console.log('DB Connected');
        
        const db = mongoose.connection.db;
        const hashedPassword = await bcrypt.hash('admin@123', 10);
        
        await db.collection('users').deleteOne({ email: 'admin@gmail.com' });
        
        await db.collection('users').insertOne({
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        console.log('ADMIN INJECTED SUCCESSFULLY');
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

seedAdmin();
