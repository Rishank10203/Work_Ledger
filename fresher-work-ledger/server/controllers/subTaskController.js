import SubTask from '../models/SubTask.js';
import Task from '../models/Task.js';
import SubTaskAttachment from '../models/SubTaskAttachment.js';
import multer from 'multer';
import fs from 'fs';

// Configure Multer for attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/subtasks';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @desc    Get all subtasks for a task
// @route   GET /api/subtasks/:taskId
export const getSubTasks = async (req, res) => {
  try {
    const taskId = req.params.taskId || req.query.taskId;
    if (!taskId) return res.status(400).json({ message: 'taskId is required' });
    
    const subTasks = await SubTask.find({ taskId }).sort({ createdAt: 1 });
    // Fetch and attach attachments for each subtask
    const subTasksWithAttachments = await Promise.all(subTasks.map(async (st) => {
      const attachments = await SubTaskAttachment.find({ subTaskId: st._id });
      return { ...st.toObject(), attachments };
    }));
    res.json(subTasksWithAttachments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a subtask
// @route   POST /api/subtasks
export const createSubTask = async (req, res) => {
  try {
    const { taskId, title } = req.body;
    const subTask = await SubTask.create({
      taskId,
      title,
      createdBy: req.user._id
    });

    // Handle multiple file uploads
    if (req.files && req.files.length > 0) {
      const attachments = await Promise.all(req.files.map(file => 
        SubTaskAttachment.create({
          subTaskId: subTask._id,
          url: `/uploads/subtasks/${file.filename}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        })
      ));
      return res.status(201).json({ ...subTask.toObject(), attachments });
    }

    res.status(201).json({ ...subTask.toObject(), attachments: [] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a subtask (title or completion)
// @route   PUT /api/subtasks/:id
export const updateSubTask = async (req, res) => {
  try {
    const subTask = await SubTask.findById(req.params.id);
    if (!subTask) return res.status(404).json({ message: 'Subtask not found' });

    // RBAC: Non-admins can only toggle completion
    if (req.user.role !== 'admin') {
      const allowedKeys = ['isCompleted'];
      const requestedKeys = Object.keys(req.body);
      const isOnlyToggle = requestedKeys.every(key => allowedKeys.includes(key));
      
      if (!isOnlyToggle) {
        return res.status(403).json({ message: 'Authorization Denied: Only Admin can modify subtask parameters.' });
      }
    }

    const updatedSubTask = await SubTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // If completion changed, check if all are done
    if (req.body.isCompleted !== undefined) {
      const allSubTasks = await SubTask.find({ taskId: subTask.taskId });
      const allDone = allSubTasks.every(st => st.isCompleted);
      
      if (allDone && allSubTasks.length > 0) {
        await Task.findByIdAndUpdate(subTask.taskId, { status: 'done' });
      }
    }

    const attachments = await SubTaskAttachment.find({ subTaskId: subTask._id });
    res.json({ ...updatedSubTask.toObject(), attachments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a subtask
// @route   DELETE /api/subtasks/:id
export const deleteSubTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Operational Block: Only Admin can decommission subtasks.' });
    }
    const subTask = await SubTask.findById(req.params.id);
    if (!subTask) return res.status(404).json({ message: 'Subtask not found' });

    await SubTask.findByIdAndDelete(req.params.id);
    // Delete related attachments
    await SubTaskAttachment.deleteMany({ subTaskId: req.params.id });
    
    res.json({ message: 'Subtask removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
