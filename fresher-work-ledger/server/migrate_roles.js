import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({
  role: String
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Migrating User roles...');

    // Project Manager, Team Member -> user
    const usersToUpdate = await User.find({ role: { $in: ['Project Manager', 'Team Member', 'Client', 'Admin'] } });
    
    for (const user of usersToUpdate) {
      let newRole = 'user';
      if (user.role === 'Admin') newRole = 'admin';
      if (user.role === 'Client') newRole = 'client';
      
      await User.updateOne({ _id: user._id }, { $set: { role: newRole } });
      console.log(`Updated ${user.role} to ${newRole}`);
    }

    console.log('Migration Complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
