import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

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

    const tasksToFix = await Task.find({ project: { $exists: true } });
    console.log(`Found ${tasksToFix.length} tasks with 'project' field`);

    for (const task of tasksToFix) {
      const pId = task.projectId || task.get('project');
      await Task.updateOne(
        { _id: task._id },
        { 
          $set: { projectId: pId },
          $unset: { project: "" }
        }
      );
    }

    console.log('Migration Successfully Completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration Error:', err);
    process.exit(1);
  }
}

run();
