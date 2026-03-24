import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/Task.js';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tasks = await Task.find({ project: { $exists: true } });
    console.log(`Found ${tasks.length} tasks with 'project' field`);

    for (const task of tasks) {
      task.projectId = task.project;
      // We don't necessarily delete the field yet to be safe, 
      // but the model will only use projectId now.
      // However, to be clean:
      const taskObj = task.toObject();
      const projectId = taskObj.project;
      
      await Task.updateOne(
        { _id: task._id },
        { 
          $set: { projectId: projectId },
          $unset: { project: "" } 
        }
      );
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
