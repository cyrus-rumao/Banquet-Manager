import express from 'express';
import {
	checkConflict,
	createEvent,
	getMyEvents,
  getAllEvents,
  confirmEnquiry,
  getEventById,
} from '../controllers/eventController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔥 step-1 conflict check
router.post('/check-conflict', protect, checkConflict);

// 🧾 create event
router.post('/', protect, createEvent);

// 📦 get my events
router.get('/:id', getEventById);
router.get('/event/my', protect, getMyEvents);
router.get('/', getAllEvents); // For simplicity, using same handler. In real app, you'd have a separate one for admins to view all events.
router.patch('/:id/confirm', confirmEnquiry);
export default router;
