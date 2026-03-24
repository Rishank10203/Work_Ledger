import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isBillable: { type: Boolean, required: true, default: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['todo', 'inprogress', 'review', 'done'], 
    default: 'todo' 
  },
  estimatedHours: { type: Number, default: 0 },
  deadline: { type: Date },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
