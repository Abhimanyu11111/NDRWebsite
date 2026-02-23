import express from 'express';
import { getUserProfile, getUserBookings, getPaymentHistory } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/adminAuth.js'; //  Now available

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.get('/bookings', authenticateToken, getUserBookings);
router.get('/payments', authenticateToken, getPaymentHistory);

export default router;
