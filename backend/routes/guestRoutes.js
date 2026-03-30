import express from 'express';
const router = express.Router();
import {
	getGuestsByEvent,
	markGuestArrived,
} from '../controllers/guestController.js';

// GET guests by eventId
router.get('/', getGuestsByEvent);

// PATCH guest arrival
router.patch('/:id/arrive', markGuestArrived);

export default router;
