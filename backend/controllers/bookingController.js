import Booking from "../models/Booking.js";
import Room from "../models/room.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { Op } from "sequelize";

import {
  generateBookingId,
} from "../utils/dateHelpers.js";

import {
  sendBookingConfirmation,
  sendSlotAvailableNotification,
} from "../src/services/emailService.js";

import { DURATION_MAP } from "../utils/durationMap.js";
import {
  violatesAdvanceRule,
  hasWeekendInRange,
} from "../utils/bookingRules.js";

/* =====================================================
   CHECK AVAILABILITY (SLOT + RULE SAFE)
===================================================== */
export const checkAvailability = async (req, res) => {
  try {
    const { room_id, start_datetime, end_datetime } = req.body;

    if (!room_id || !start_datetime || !end_datetime) {
      return res.status(400).json({
        success: false,
        message: "room_id, start_datetime and end_datetime are required",
      });
    }

    const start = new Date(start_datetime);
    const end = new Date(end_datetime);

    // ⛔ 3-DAY ADVANCE RULE
    if (violatesAdvanceRule(start)) {
      return res.status(400).json({
        success: false,
        message: "Bookings must be made at least 3 days in advance",
      });
    }

    const conflict = await Booking.findOne({
      where: {
        room_id,
        status: { [Op.in]: ["PENDING", "CONFIRMED"] },
        start_datetime: { [Op.lt]: end },
        end_datetime: { [Op.gt]: start },
      },
    });

    res.json({
      success: true,
      available: !conflict,
    });
  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to check availability",
    });
  }
};

/* =====================================================
   CREATE BOOKING (FINAL & SAFE)
===================================================== */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      room_id,
      bookingType,
      start_datetime,
      end_datetime,
      dataCatalogue,
      weekendNotice,
    } = req.body;

    if (!room_id || !bookingType || !start_datetime) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking fields",
      });
    }

    const user = await User.findByPk(userId);
    const room = await Room.findByPk(room_id);
    if (!user || !room) {
      return res.status(404).json({
        success: false,
        message: "User or Room not found",
      });
    }

    const start = new Date(start_datetime);
    let end;
    let durationMinutes;

    if (bookingType === "MULTI_DAY") {
      if (!end_datetime) {
        return res.status(400).json({
          success: false,
          message: "end_datetime required for MULTI_DAY booking",
        });
      }
      end = new Date(end_datetime);
      durationMinutes = Math.floor((end - start) / 60000);
    } else {
      durationMinutes = DURATION_MAP[bookingType];
      end = new Date(start.getTime() + durationMinutes * 60000);
    }

    /* ⛔ 3-DAY ADVANCE RULE */
    if (violatesAdvanceRule(start)) {
      return res.status(400).json({
        success: false,
        message: "Booking must be made at least 3 days in advance",
      });
    }

    /* ⛔ WEEKEND RULE */
    const hasWeekend = hasWeekendInRange(start, end);
    if (hasWeekend && !weekendNotice) {
      return res.status(400).json({
        success: false,
        message: "Weekend booking requires admin advance notice",
      });
    }

    /* 🔒 SLOT OVERLAP CHECK */
    const conflict = await Booking.findOne({
      where: {
        room_id,
        status: { [Op.in]: ["PENDING", "CONFIRMED"] },
        start_datetime: { [Op.lt]: end },
        end_datetime: { [Op.gt]: start },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const finalStatus = hasWeekend ? "PENDING" : "CONFIRMED";

    const booking = await Booking.create({
      booking_id: generateBookingId(),
      user_id: userId,
      room_id,
      booking_type: bookingType,
      start_datetime: start,
      end_datetime: end,
      duration_minutes: durationMinutes,
      data_catalogue: dataCatalogue || [],
      weekend_notice: weekendNotice || null,
      status: finalStatus,
    });

    await sendBookingConfirmation({
      email: user.email,
      name: user.name,
      bookingId: booking.booking_id,
      room: room.title,
      startDate: start.toLocaleString(),
      endDate: end.toLocaleString(),
    });

    res.status(201).json({
      success: true,
      bookingId: booking.booking_id,
      status: booking.status,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({
      success: false,
      message: "Booking failed",
    });
  }
};

/* =====================================================
   CANCEL BOOKING
===================================================== */
export const cancelBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const booking = await Booking.findOne({
      where: { booking_id },
      include: [{ model: Room, as: "room" }],
    });

    if (!booking) {
      return res.status(404).json({ success: false });
    }

    booking.status = "CANCELLED";
    await booking.save();

    const notifications = await Notification.findAll({
      where: {
        room_id: booking.room_id,
        is_active: true,
      },
      include: [{ model: User, as: "user" }],
    });

    for (const n of notifications) {
      await sendSlotAvailableNotification({
        email: n.user.email,
        name: n.user.name,
        room: booking.room.title,
      });
      n.is_active = false;
      await n.save();
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({
      success: false,
      message: "Cancel failed",
    });
  }
};

/* =====================================================
   USER BOOKINGS
===================================================== */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { user_id: userId },
      include: [{ model: Room, as: "room" }],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

/* =====================================================
   CALENDAR (TIME-BASED)
===================================================== */
export const getBookingCalendar = async (req, res) => {
  try {
    const { room_id } = req.query;

    if (!room_id) {
      return res.status(400).json({
        success: false,
        message: "room_id is required",
      });
    }

    const bookings = await Booking.findAll({
      where: {
        room_id,
        status: { [Op.in]: ["PENDING", "CONFIRMED"] },
      },
      include: [{ model: User, as: "user", attributes: ["name"] }],
      order: [["start_datetime", "ASC"]],
    });

    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error("Calendar error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load calendar",
    });
  }
};
/* =====================================================
   BOOKING PREVIEW (PRICE + TIME CHECK)
===================================================== */
export const getBookingPreview = async (req, res) => {
  try {
    const {
      room_id,
      bookingType,
      start_datetime,
      end_datetime,
    } = req.body;

    if (!room_id || !bookingType || !start_datetime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for preview",
      });
    }

    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const start = new Date(start_datetime);
    let end;
    let durationMinutes;

    if (bookingType === "MULTI_DAY") {
      if (!end_datetime) {
        return res.status(400).json({
          success: false,
          message: "end_datetime required for MULTI_DAY booking",
        });
      }
      end = new Date(end_datetime);
      durationMinutes = Math.floor((end - start) / 60000);
    } else {
      durationMinutes = DURATION_MAP[bookingType];
      end = new Date(start.getTime() + durationMinutes * 60000);
    }

    // ⚠️ Rules preview (no DB write)
    const hasWeekend = hasWeekendInRange(start, end);
    const violatesAdvance = violatesAdvanceRule(start);

    res.json({
      success: true,
      preview: {
        room: room.title,
        start,
        end,
        durationMinutes,
        hasWeekend,
        violatesAdvance,
        estimatedPrice: room.price_per_hour
          ? Math.ceil(durationMinutes / 60) * room.price_per_hour
          : null,
      },
    });
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate booking preview",
    });
  }
};