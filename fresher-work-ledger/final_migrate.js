import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const TaskSchema = new mongoose.Schema({
  title: String,
  project: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId
}, { strict: false });

const Task = mongoose.model('Task', TaskSchema);

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in .env');
    
    await mongoose.connect(uri);
    console.log('Connected to DB');

    // 1. Rename 'project' to 'projectId' where 'projectId' is missing
    const tasksToFix = await Task.find({ project: { $exists: true }, projectId: { $exists: false } });
    console.log(`Found ${tasksToFix.length} tasks to fix`);

    for (const task of tasksToFix) {
      await Task.updateOne(
        { _id: task._id },
        { 
          $set: { projectId: task.project },
          $unset: { project: "" }
        }
      );
    }

    // 2. Ensure all have projectId (if they had project)
    const totalSet = await Task.countDocuments({ projectId: { $exists: true } });
    console.log(`Total tasks with projectId: ${totalSet}`);

    console.log('Migration Successfully Completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration Error:', err);
    process.exit(1);
  }
}

run();
