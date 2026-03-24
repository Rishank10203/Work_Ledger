import mongoose from 'mongoose';
import Task from './models/Task.js';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/work-ledger');
  
  const mapping = {
    'To Do': 'todo',
    'In Progress': 'inprogress',
    'Review': 'review',
    'Done': 'done'
  };

  for (const [oldVal, newVal] of Object.entries(mapping)) {
    const res = await Task.updateMany({ status: oldVal }, { $set: { status: newVal } });
    console.log(`Migrated ${res.modifiedCount} tasks from '${oldVal}' to '${newVal}'`);
  }

  process.exit(0);
};

migrate();
