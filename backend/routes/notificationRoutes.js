import express from "express";
import authMiddleware from "../middleware/auth.js";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router();

/**
 * All routes require authentication
 */

// Subscribe to slot availability notification
router.post('/subscribe', authMiddleware, notificationController.subscribeToSlot);

// Get user's notification subscriptions
router.get('/subscriptions', authMiddleware, notificationController.getUserSubscriptions);

// Unsubscribe from notification
router.delete('/unsubscribe/:subscription_id', authMiddleware, notificationController.unsubscribe);

export default router;
