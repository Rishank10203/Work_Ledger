import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getTasksByProject } from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/by-project/:projectId', protect, getTasksByProject);

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('admin'), createTask);

router.route('/:id')
  .put(protect, updateTask)
  .patch(protect, updateTask)
  .delete(protect, authorize('admin'), deleteTask);

export default router;
