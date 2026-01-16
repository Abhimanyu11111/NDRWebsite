import express from "express";
import { bookSlot, getFullBookedDates, getAvailableDates } from "../controllers/bookingController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";
import { getAllBookingsAdmin } from "../controllers/bookingController.js";


const router = express.Router();

// Book a slot
router.post("/book", bookSlot);

// Fully booked dates (RED)
router.get("/full-booked-dates", getFullBookedDates);

// Dates where at least one slot is available (GREEN)
router.get("/available-dates", getAvailableDates);

router.get("/admin/all", verifyAdmin, getAllBookingsAdmin);


export default router;
