import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
	uploadImage,
	getGalleryByEvent,
	getAdminGallery,
	approveImage,
	deleteImage,
} from '../controllers/brownieController.js';

const router = express.Router();
router.post('/upload', uploadImage);

router.get('/:eventId', getGalleryByEvent);
router.get('/admin/:eventId', protect, getAdminGallery);

router.patch('/:id/approve', protect, approveImage);
// router.patch('/:id/remove', protect, removeImage);

router.delete('/:id', protect, deleteImage);

// router.patch('/:id/like', likeImage);

export default router;
