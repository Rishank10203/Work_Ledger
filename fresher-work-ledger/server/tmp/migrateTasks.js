import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresher-ledger';

const taskSchema = new mongoose.Schema({
  title: String,
  project: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
}, { strict: false });

const Task = mongoose.model('Task', taskSchema);

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const tasks = await Task.find({ project: { $exists: false }, projectId: { $exists: true } });
    console.log(`Found ${tasks.length} tasks to migrate.`);

    for (const task of tasks) {
      task.project = task.projectId;
      await task.save();
      console.log(`Migrated task: ${task.title}`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
