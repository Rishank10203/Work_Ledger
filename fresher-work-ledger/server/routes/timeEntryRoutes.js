import express from 'express';
import { getTimeEntries, startTimer, stopTimer, addManualTime, updateTimeEntry, deleteTimeEntry, getProjectWiseTime } from '../controllers/timeEntryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getTimeEntries);
router.post('/start', protect, startTimer);
router.put('/stop/:id', protect, stopTimer);
router.post('/manual', protect, addManualTime);

router.get('/analytics/project-wise', protect, getProjectWiseTime);

router.route('/:id')
  .put(protect, updateTimeEntry)
  .delete(protect, deleteTimeEntry);

export default router;
