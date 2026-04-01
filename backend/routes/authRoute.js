import express from 'express';

import {
	login,
	logout,
	getProfile,
	signup,
	refreshToken,
	// getProfile,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', signup);
router.post('/logout', logout);
router.post('/profile', getProfile);
router.post('/refresh-token', refreshToken);
router.get('/profile', protect, getProfile);
// router.post('/logout', logout);

export default router;
