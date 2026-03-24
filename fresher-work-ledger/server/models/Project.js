import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['Active', 'On Hold', 'Completed'], 
    default: 'Active' 
  },
  estimatedHours: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
