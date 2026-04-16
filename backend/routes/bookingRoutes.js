import express from "express";
import authMiddleware from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/adminAuth.js";
import * as bookingController from "../controllers/bookingController.js";

const router = express.Router();

/**
 * All routes require authentication
 */

// Check availability for a room
router.post(
  "/check-availability",
  authMiddleware,
  bookingController.checkAvailability
);

// Get booking preview with pricing
router.post(
  "/preview",
  authMiddleware,
  bookingController.getBookingPreview
);

// Create new booking
router.post(
  "/create",
  authMiddleware,
  bookingController.createBooking
);

// Get user's bookings
router.get(
  "/my-bookings",
  authMiddleware,
  bookingController.getUserBookings
);

// Get booking details for admin
router.get(
  "/admin/:booking_id",
  verifyAdmin,
  bookingController.getAdminBookingDetails
);

// Get calendar view of bookings for a room
router.get(
  "/calendar",
  authMiddleware,
  bookingController.getBookingCalendar
);

// Cancel booking
router.put(
  "/cancel/:booking_id",
  authMiddleware,
  bookingController.cancelBooking
);

export default router;
