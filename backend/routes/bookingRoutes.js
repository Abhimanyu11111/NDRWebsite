import express from "express";
import authMiddleware from "../middleware/auth.js";
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
console.log("authMiddleware:", authMiddleware);
console.log("getBookingPreview:", bookingController.getBookingPreview);
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

console.log("calendar fn:", bookingController.getBookingCalendar);
console.log("user bookings fn:", bookingController.getUserBookings);

export default router;
