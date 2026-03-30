import express from 'express';
import { SendQR } from '../controllers/whatsappController.js';

const router = express.Router();

router.post('/send-message', SendQR);
export default router;
