import mongoose from 'mongoose';

const subTaskAttachmentSchema = new mongoose.Schema({
  subTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubTask',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  mimetype: {
    type: String
  },
  size: {
    type: Number
  }
}, {
  timestamps: true
});

const SubTaskAttachment = mongoose.model('SubTaskAttachment', subTaskAttachmentSchema);

export default SubTaskAttachment;
