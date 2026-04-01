import express from 'express';

import {
	getVenues,
	createVenue,
	updateVenue,
	deleteVenue,
} from '../controllers/venueController.js';
import { protect, adminRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVenues);
router.post('/', protect, adminRoute, createVenue);
router.put('/:id', protect, adminRoute, updateVenue);
router.delete('/:id', protect, adminRoute, deleteVenue);

export default router;
