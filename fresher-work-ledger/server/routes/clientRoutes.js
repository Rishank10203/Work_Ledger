import express from 'express';
import { getClients, createClient, getClientById, updateClient, deleteClient } from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getClients)
  .post(protect, authorize('admin', 'user'), createClient); // User (PM) can create too

router.route('/:id')
  .get(protect, getClientById)
  .put(protect, authorize('admin'), updateClient)
  .delete(protect, authorize('admin'), deleteClient);

export default router;
