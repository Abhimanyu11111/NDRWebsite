import express from 'express';
import { initiatePayment, paymentResponse } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/adminAuth.js'; //  Now available

const router = express.Router();

router.post('/initiate', authenticateToken, initiatePayment);
router.post('/callback', paymentResponse); //  No auth needed for callback

export default router;