import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isBillable: { type: Boolean, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  durationSeconds: { type: Number, default: 0 },
  description: { type: String },
  isActive: { type: Boolean, default: false } // Only one active timer per user
}, { timestamps: true });

export default mongoose.model('TimeEntry', timeEntrySchema);
