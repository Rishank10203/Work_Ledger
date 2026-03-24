import { getSubTasks, createSubTask, updateSubTask, deleteSubTask, upload } from '../controllers/subTaskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import express from 'express';

const router = express.Router();

// Option 1: Query param support and POST
router.route('/')
  .get(protect, getSubTasks)
  .post(protect, authorize('admin', 'user', 'client'), upload.array('attachments', 10), createSubTask);

// Option 2: URL param (REQUIRED)
router.get('/:taskId', protect, getSubTasks);

// ID operations
router.put('/:id', protect, updateSubTask);
router.delete('/:id', protect, authorize('admin'), deleteSubTask);

export default router;

