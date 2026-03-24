import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);
