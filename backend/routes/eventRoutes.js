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
// console.log('🔥 EVENTS ROUTE LOADED');
// 🔥 step-1 conflict check
router.post('/check-conflict', protect, checkConflict);
// router.post('/', (req, res) => {
// 	console.log('🔥 CREATE EVENT HIT');
// 	res.send('WORKING');
// });
// 🧾 create event
router.post('/create-event', protect, createEvent);

// 📦 get my events
router.get('/event/my', protect, getMyEvents);
router.get('/', protect, getAllEvents); // For simplicity, using same handler. In real app, you'd have a separate one for admins to view all events.
router.get('/:id', getEventById);
router.patch('/:id/confirm', protect, confirmEnquiry);
export default router;
