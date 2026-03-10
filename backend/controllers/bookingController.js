import sequelize from "../src/config/db.js";
import Booking from "../models/Booking.js";
import DatasetLock from "../models/DatasetLock.js";
import Room from "../models/Slot.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { Op } from "sequelize";

import { generateBookingId } from "../utils/dateHelpers.js";
import { sendBookingConfirmation, sendSlotAvailableNotification } from "../src/services/emailService.js";

import {
  DURATION_MAP,
  countWorkingDays,
  calcWorkingDaySurcharge,
} from "../utils/durationMap.js";

import {
  violatesAdvanceRule,
  violatesMaxAdvanceRule,
  hasWeekendInRange,
  validateBookingRequest,
  getHolidaySet,
} from "../utils/bookingRules.js";

/* =====================================================
   PRICE CALCULATOR
===================================================== */
const calculateRoomPrice = (bookingType, durationMinutes, room) => {
  if (bookingType === "HOURLY")    return Math.ceil(durationMinutes / 60) * room.hourly_rate;
  if (bookingType === "HALF_DAY")  return room.half_day_rate;
  if (bookingType === "FULL_DAY")  return room.full_day_rate;
  if (bookingType === "ONE_WEEK")  return 7 * room.full_day_rate;
  if (bookingType === "MULTI_DAY") return Math.ceil(durationMinutes / 1440) * room.full_day_rate;
  return 0;
};

/* =====================================================
   DURATION HELPER —  ONE_WEEK support
===================================================== */
const resolveDuration = (bookingType, start_datetime, end_datetime) => {
  const start = new Date(start_datetime);
  let end, durationMinutes;

  if (bookingType === "MULTI_DAY") {
    end             = new Date(end_datetime);
    durationMinutes = Math.floor((end - start) / 60000);
  } else if (bookingType === "ONE_WEEK") {
    end             = new Date(start);
    end.setDate(end.getDate() + 7);
    durationMinutes = 10080; // 7 * 24 * 60
  } else {
    durationMinutes = DURATION_MAP[bookingType];
    end             = new Date(start.getTime() + durationMinutes * 60000);
  }

  return { start, end, durationMinutes };
};

/* =====================================================
   DATASET LOCK HELPER
===================================================== */
const lockDatasetsForBooking = async (booking, transaction) => {
  const datasetIds = booking.data_catalogue;
  if (!datasetIds || datasetIds.length === 0) return;

  await DatasetLock.destroy({
    where: { booking_id: booking.booking_id, status: "ACTIVE" },
    transaction,
  });

  const locks = datasetIds.map((dataset_id) => ({
    dataset_id,
    booking_id: booking.booking_id,
    user_id:    booking.user_id,
    locked_at:  new Date(),
    expires_at: booking.end_datetime,
    status:     "ACTIVE",
  }));

  await DatasetLock.bulkCreate(locks, { transaction });
};

/* =====================================================
   CHECK AVAILABILITY
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
    const end   = new Date(end_datetime);

    if (violatesAdvanceRule(start)) {
      return res.status(400).json({
        success: false,
        message: "Bookings must be made at least 3 days in advance",
      });
    }

    const conflict = await Booking.findOne({
      where: {
        room_id,
        status:         { [Op.in]: ["PENDING", "CONFIRMED"] },
        start_datetime: { [Op.lt]: end },
        end_datetime:   { [Op.gt]: start },
      },
    });

    res.json({ success: true, available: !conflict });
  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({ success: false, message: "Failed to check availability" });
  }
};

/* =====================================================
   BOOKING PREVIEW
===================================================== */
export const getBookingPreview = async (req, res) => {
  try {
    const { room_id, bookingType, start_datetime, end_datetime, halfDaySlot } = req.body;

    if (!room_id || !bookingType || !start_datetime) {
      return res.status(400).json({ success: false, message: "Missing required fields for preview" });
    }

    const room = await Room.findByPk(room_id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    const { start, end, durationMinutes } = resolveDuration(bookingType, start_datetime, end_datetime);

    const holidaySet          = await getHolidaySet();
    const workingDays         = countWorkingDays(start, end, holidaySet);
    const workingDaySurcharge = calcWorkingDaySurcharge(workingDays);
    const roomPrice           = calculateRoomPrice(bookingType, durationMinutes, room);
    const estimatedTotal      = roomPrice + workingDaySurcharge;

    const { valid, errors } = await validateBookingRequest({
      startDatetime: start,
      bookingType,
      halfDaySlot,
    });

    res.json({
      success: true,
      preview: {
        room: room.title,
        start,
        end,
        durationMinutes,
        bookingType,
        halfDaySlot:        halfDaySlot || null,
        hasWeekend:         hasWeekendInRange(start, end),
        violatesAdvance:    violatesAdvanceRule(start),
        violatesMaxAdvance: violatesMaxAdvanceRule(start),
        workingDays,
        pricing: {
          roomPrice:           roomPrice.toFixed(2),
          workingDaySurcharge: workingDaySurcharge.toFixed(2),
          estimatedTotal:      estimatedTotal.toFixed(2),
        },
        validationWarnings: valid ? [] : errors,
      },
    });
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ success: false, message: "Failed to generate booking preview" });
  }
};

/* =====================================================
   CREATE BOOKING
===================================================== */
export const createBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const {
      room_id,
      bookingType,
      start_datetime,
      end_datetime,
      dataCatalogue,
      weekendNotice,
      halfDaySlot,
    } = req.body;

    if (!room_id || !bookingType || !start_datetime) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Missing required booking fields" });
    }

    // Validate
    const { valid, errors } = await validateBookingRequest({
      startDatetime: new Date(start_datetime),
      bookingType,
      halfDaySlot,
    });

    if (!valid) {
      await t.rollback();
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const [user, room] = await Promise.all([
      User.findByPk(userId),
      Room.findByPk(room_id, { lock: t.LOCK.UPDATE, transaction: t }),
    ]);

    if (!user || !room) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "User or Room not found" });
    }

    //  ONE_WEEK + MULTI_DAY + all other types handled here
    const { start, end, durationMinutes } = resolveDuration(bookingType, start_datetime, end_datetime);

    if (bookingType === "MULTI_DAY" && !end_datetime) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "end_datetime required for MULTI_DAY booking" });
    }

    const hasWeekend = hasWeekendInRange(start, end);
    if (hasWeekend && !weekendNotice) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Weekend booking requires advance notice. Please fill the Weekend Notice field.",
      });
    }

    // Conflict check
    const conflict = await Booking.findOne({
      where: {
        room_id,
        status:         { [Op.in]: ["PENDING", "CONFIRMED"] },
        start_datetime: { [Op.lt]: end },
        end_datetime:   { [Op.gt]: start },
      },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (conflict) {
      await t.rollback();
      return res.status(409).json({ success: false, message: "This time slot is already booked" });
    }

    // Pricing
    const holidaySet          = await getHolidaySet();
    const workingDays         = countWorkingDays(start, end, holidaySet);
    const workingDaySurcharge = calcWorkingDaySurcharge(workingDays);
    const roomPrice           = calculateRoomPrice(bookingType, durationMinutes, room);
    const totalPrice          = roomPrice + workingDaySurcharge;
    const finalStatus         = hasWeekend ? "PENDING" : "CONFIRMED";

    const booking = await Booking.create(
      {
        booking_id:            generateBookingId(),
        user_id:               userId,
        room_id,
        booking_type:          bookingType,
        half_day_slot:         bookingType === "HALF_DAY" ? halfDaySlot.toUpperCase() : null,
        start_datetime:        start,
        end_datetime:          end,
        duration_minutes:      durationMinutes,
        data_catalogue:        dataCatalogue || [],
        weekend_notice:        weekendNotice || null,
        working_days:          workingDays,
        working_day_surcharge: workingDaySurcharge,
        room_price:            roomPrice,
        total_price:           totalPrice,
        status:                finalStatus,
      },
      { transaction: t }
    );

    await t.commit();

    sendBookingConfirmation({
      email:     user.email,
      name:      user.name,
      bookingId: booking.booking_id,
      room:      room.title,
      startDate: start.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      endDate:   end.toLocaleString("en-IN",   { timeZone: "Asia/Kolkata" }),
    }).catch((e) => console.error("Email error:", e));

    res.status(201).json({
      success:    true,
      booking_id: booking.booking_id,
      status:     booking.status,
      totalPrice,
      workingDays,
      workingDaySurcharge,
      message:
        finalStatus === "PENDING"
          ? "Booking created. Pending admin approval (weekend booking)."
          : "Booking confirmed! Please complete payment.",
    });
  } catch (err) {
    await t.rollback();
    console.error("Create booking error:", err);
    res.status(500).json({ success: false, message: "Booking failed" });
  }
};

/* =====================================================
   USER BOOKINGS
===================================================== */
export const getUserBookings = async (req, res) => {
  try {
    const userId   = req.user.id;
    const bookings = await Booking.findAll({
      where:   { user_id: userId },
      include: [{ model: Room, as: "room" }],
      order:   [["created_at", "DESC"]],
    });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

/* =====================================================
   CALENDAR BOOKINGS
===================================================== */
export const getBookingCalendar = async (req, res) => {
  try {
    const { room_id } = req.query;
    if (!room_id) {
      return res.status(400).json({ success: false, message: "room_id is required" });
    }

    const bookings = await Booking.findAll({
      where: {
        room_id,
        status: { [Op.in]: ["PENDING", "CONFIRMED"] },
      },
      include: [{ model: User, as: "user", attributes: ["name"] }],
      order:   [["start_datetime", "ASC"]],
    });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Calendar error:", err);
    res.status(500).json({ success: false, message: "Failed to load calendar" });
  }
};

/* =====================================================
   CANCEL BOOKING
===================================================== */
export const cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { booking_id } = req.params;

    const booking = await Booking.findOne({
      where:   { booking_id },
      include: [{ model: Room, as: "room" }],
      lock:    t.LOCK.UPDATE,
      transaction: t,
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await DatasetLock.update(
      { status: "RELEASED", released_at: new Date() },
      { where: { booking_id, status: "ACTIVE" }, transaction: t }
    );

    booking.status = "CANCELLED";
    await booking.save({ transaction: t });
    await t.commit();

    const notifications = await Notification.findAll({
      where:   { room_id: booking.room_id, is_active: true },
      include: [{ model: User, as: "user" }],
    });

    for (const n of notifications) {
      await sendSlotAvailableNotification({
        email: n.user.email,
        name:  n.user.name,
        room:  booking.room.title,
      }).catch((e) => console.error("Notification email error:", e));
      n.is_active = false;
      await n.save();
    }

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Cancel error:", err);
    res.status(500).json({ success: false, message: "Cancel failed" });
  }
};

/* =====================================================
   CONFIRM BOOKING AFTER PAYMENT
===================================================== */
export const confirmBookingAfterPayment = async (bookingId, transaction) => {
  const booking = await Booking.findOne({
    where: { booking_id: bookingId },
    lock:  transaction.LOCK.UPDATE,
    transaction,
  });

  if (!booking) throw new Error(`Booking ${bookingId} not found`);
  if (booking.status === "CONFIRMED") return booking;

  booking.status         = "CONFIRMED";
  booking.dataset_locked = true;
  await booking.save({ transaction });

  await lockDatasetsForBooking(booking, transaction);
  return booking;
};