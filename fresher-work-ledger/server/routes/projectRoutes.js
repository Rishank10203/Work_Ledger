import express from 'express';
import { getProjects, createProject, getProjectById, updateProject, deleteProject } from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

export default router;
