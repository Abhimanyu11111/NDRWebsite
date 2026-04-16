import Booking from "../models/Booking.js";
import DatasetLock from "../models/DatasetLock.js";
import { Op } from "sequelize";

// ─── Simple in-process cache (no Redis needed) ────────────────────────────────
const _cache = new Map(); // key → { value, expiresAt }
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const cacheGet = (key) => {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.value;
};
const cacheSet = (key, value) => {
  _cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};
export const invalidateAccessCache = (userId) => {
  for (const key of _cache.keys()) {
    if (key.startsWith(`acc:${userId}:`)) _cache.delete(key);
  }
};

// ─── Admin bypass ─────────────────────────────────────────────────────────────
export const adminBypass = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "superadmin") {
    req.adminBypass = true;
  }
  next();
};

// ─── Room-level access ────────────────────────────────────────────────────────
/**
 * Ensures user has a CONFIRMED booking for the requested room RIGHT NOW.
 * Expects: req.params.room_id  OR  req.body.room_id
 */
export const requireRoomAccess = async (req, res, next) => {
  if (req.adminBypass) return next();

  const userId = req.user?.id;
  const roomId = req.params.room_id || req.body.room_id;

  if (!userId || !roomId) {
    return res.status(403).json({ success: false, message: "Missing user or room context." });
  }

  const cacheKey = `acc:${userId}:room:${roomId}`;
  const cached   = cacheGet(cacheKey);
  if (cached !== null) {
    if (!cached) return res.status(403).json({ success: false, message: "No active booking for this room." });
    req.activeBooking = cached;
    return next();
  }

  try {
    const booking = await Booking.findOne({
      where: {
        user_id:        userId,
        room_id:        roomId,
        status:         "CONFIRMED",
        start_datetime: { [Op.lte]: new Date() },
        end_datetime:   { [Op.gte]: new Date() },
        access_suspended: false,  // 4-day window check
      },
    });

    cacheSet(cacheKey, booking || false);

    if (!booking) {
      return res.status(403).json({ success: false, message: "No active booking for this room." });
    }

    //  Record first access time (starts the 4-day continuous access clock)
    if (!booking.first_accessed_at) {
      booking.first_accessed_at = new Date();
      await booking.save();
    }

    req.activeBooking = booking;
    next();
  } catch (err) {
    console.error("[bookingAccess.requireRoomAccess]", err);
    res.status(500).json({ success: false, message: "Access check failed." });
  }
};

// ─── Dataset-level access ─────────────────────────────────────────────────────
/**
 * Ensures the user has an active dataset lock for the requested dataset.
 * ONLY datasets linked to their booking can be viewed.
 * Expects: req.params.dataset_id  OR  req.body.dataset_id
 */
export const requireDatasetAccess = async (req, res, next) => {
  if (req.adminBypass) return next();

  const userId    = req.user?.id;
  const datasetId = req.params.dataset_id || req.body.dataset_id;

  if (!userId || !datasetId) {
    return res.status(403).json({ success: false, message: "Missing user or dataset context." });
  }

  const cacheKey = `acc:${userId}:dataset:${datasetId}`;
  const cached   = cacheGet(cacheKey);
  if (cached !== null) {
    if (!cached) return res.status(403).json({ success: false, message: "Dataset not authorized for this booking." });
    req.datasetLock = cached;
    return next();
  }

  try {
    // Must have an ACTIVE lock (not just booking_datasets entry)
    const lock = await DatasetLock.findOne({
      where: {
        dataset_id: datasetId,
        user_id:    userId,
        status:     "ACTIVE",
        expires_at: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: Booking,
          as: "booking",
          where: {
            status:           "CONFIRMED",
            start_datetime:   { [Op.lte]: new Date() },
            end_datetime:     { [Op.gte]: new Date() },
            access_suspended: false,
          },
          required: true,
        },
      ],
    });

    cacheSet(cacheKey, lock || false);

    if (!lock) {
      return res.status(403).json({
        success: false,
        message: "Dataset not authorized. Ensure your booking is active and includes this dataset.",
      });
    }

    req.datasetLock = lock;
    next();
  } catch (err) {
    console.error("[bookingAccess.requireDatasetAccess]", err);
    res.status(500).json({ success: false, message: "Dataset access check failed." });
  }
};

// ─── Booking ownership ────────────────────────────────────────────────────────
/**
 * Ensures the user owns the booking in req.params.booking_id.
 */
export const requireBookingOwnership = async (req, res, next) => {
  if (req.adminBypass) return next();

  const userId    = req.user?.id;
  const bookingId = req.params.booking_id || req.params.id;

  if (!userId || !bookingId) {
    return res.status(403).json({ success: false, message: "Missing context." });
  }

  try {
    const booking = await Booking.findOne({ where: { booking_id: bookingId, user_id: userId } });
    if (!booking) {
      return res.status(403).json({ success: false, message: "You do not own this booking." });
    }
    req.booking = booking;
    next();
  } catch (err) {
    console.error("[bookingAccess.requireBookingOwnership]", err);
    res.status(500).json({ success: false, message: "Ownership check failed." });
  }
};

// ─── Default export (legacy-compatible single middleware) ─────────────────────
/**
 * Drop-in replacement for the original bookingAccess middleware.
 * Checks room access and optionally dataset access in one call.
 */
const bookingAccess = async (req, res, next) => {
  // Admin bypass
  if (req.user?.role === "admin" || req.user?.role === "superadmin") return next();

  const userId    = req.user?.id;
  const roomId    = req.params.room_id || req.body.room_id;
  const datasetId = req.params.dataset_id || req.body.dataset_id;

  if (!userId || !roomId) {
    return res.status(403).json({ success: false, message: "Missing user or room context." });
  }

  try {
    // Room-level check
    const activeBooking = await Booking.findOne({
      where: {
        user_id:          userId,
        room_id:          roomId,
        status:           "CONFIRMED",
        start_datetime:   { [Op.lte]: new Date() },
        end_datetime:     { [Op.gte]: new Date() },
        access_suspended: false,
      },
    });

    if (!activeBooking) {
      return res.status(403).json({ success: false, message: "No active booking for this room." });
    }

    // Dataset-level check (only if dataset_id is present)
    if (datasetId) {
      const lock = await DatasetLock.findOne({
        where: {
          dataset_id: datasetId,
          booking_id: activeBooking.booking_id,
          status:     "ACTIVE",
          expires_at: { [Op.gt]: new Date() },
        },
      });

      if (!lock) {
        return res.status(403).json({ success: false, message: "Dataset not authorized for this booking." });
      }

      req.datasetLock = lock;
    }

    //  First access timestamp (starts 4-day clock)
    if (!activeBooking.first_accessed_at) {
      activeBooking.first_accessed_at = new Date();
      await activeBooking.save();
    }

    req.booking = activeBooking;
    next();
  } catch (err) {
    console.error("[bookingAccess]", err);
    res.status(500).json({ success: false, message: "Access check failed." });
  }
};

export default bookingAccess;