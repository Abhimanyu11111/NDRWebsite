import express from "express";
import {
  getDashboardCounts,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAdminBookings,
  updateBookingStatus,
  getAdminPayments,
  getDatasetLocks,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
} from "../controllers/adminDashboardController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// All admin dashboard routes protected
router.use(verifyAdmin);

// Dashboard
router.get("/counts", getDashboardCounts);

// Notifications
router.get("/notifications", getAdminNotifications);
router.patch("/notifications/read-all", markAllNotificationsRead);
router.patch("/notifications/:id/read", markNotificationRead);

// Bookings
router.get("/bookings", getAdminBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

// Payments
router.get("/payments", getAdminPayments);

// Dataset locks
router.get("/dataset-locks", getDatasetLocks);

// Registration Approvals
router.get("/registrations", getPendingRegistrations);
router.patch("/registrations/:userId/approve", approveRegistration);
router.patch("/registrations/:userId/reject", rejectRegistration);

export default router;