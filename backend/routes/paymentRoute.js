import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.js';
import {
	createInstallmentSession,
	initializeTwoStepPayment,
	paymentSuccess,
	createPaymentForEvent,
} from '../controllers/paymentController.js';
router.post('/create-installment-session', protect, createInstallmentSession);
router.post('/checkout-success', paymentSuccess);
// router.post('/two-step', initializeTwoStepPayment);
router.post('/init', protect, createPaymentForEvent);
export default router;
