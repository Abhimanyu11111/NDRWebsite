import cron from "node-cron";
import Booking from "../models/Booking.js";
import DatasetLock from "../models/DatasetLock.js";
import { Op } from "sequelize";

const MAX_CONTINUOUS_ACCESS_HOURS = 96; // 4 days

// ─── 1. Expire CONFIRMED bookings past end_datetime ───────────────────────────
const expireCompletedBookings = async () => {
  const now = new Date();

  const expiredBookings = await Booking.findAll({
    where: {
      status:       "CONFIRMED",
      end_datetime: { [Op.lt]: now },
    },
  });

  for (const booking of expiredBookings) {
    booking.status = "COMPLETED";
    await booking.save();

    //  Release dataset locks on expiry
    await DatasetLock.update(
      { status: "EXPIRED", released_at: now },
      { where: { booking_id: booking.booking_id, status: "ACTIVE" } }
    );

    console.log(`[ExpiryJob] Booking completed + locks released: ${booking.booking_id}`);
  }

  return expiredBookings.length;
};

// ─── 2. Expire PENDING bookings (no payment within 15 min) ───────────────────
const expireUnpaidBookings = async () => {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

  const unpaid = await Booking.findAll({
    where: {
      status:     "PENDING",
      created_at: { [Op.lt]: cutoff },
    },
  });

  for (const booking of unpaid) {
    booking.status = "EXPIRED";
    await booking.save();
    console.log(`[ExpiryJob] Unpaid booking expired: ${booking.booking_id}`);
  }

  return unpaid.length;
};

// ─── 3. Enforce 4-day continuous access window ────────────────────────────────
//  NEW – suspends access after 96 continuous hours even if calendar days remain
const enforceContinuousAccessLimit = async () => {
  const cutoff = new Date(Date.now() - MAX_CONTINUOUS_ACCESS_HOURS * 60 * 60 * 1000);

  const overLimit = await Booking.findAll({
    where: {
      status:            "CONFIRMED",
      first_accessed_at: { [Op.lte]: cutoff },
      access_suspended:  false,
    },
  });

  for (const booking of overLimit) {
    booking.access_suspended = true;
    await booking.save();

    //  Release dataset locks when access window closes
    await DatasetLock.update(
      { status: "EXPIRED", released_at: new Date() },
      { where: { booking_id: booking.booking_id, status: "ACTIVE" } }
    );

    console.log(
      `[ExpiryJob] 96h access window closed. Booking: ${booking.booking_id}, ` +
      `first accessed: ${booking.first_accessed_at}`
    );
  }

  return overLimit.length;
};

// ─── 4. Release expired dataset locks (safety net) ───────────────────────────
//  NEW – catches any locks whose expires_at passed but status wasn't updated
const releaseExpiredLocks = async () => {
  const [updated] = await DatasetLock.update(
    { status: "EXPIRED", released_at: new Date() },
    {
      where: {
        status:     "ACTIVE",
        expires_at: { [Op.lt]: new Date() },
      },
    }
  );

  if (updated > 0) {
    console.log(`[ExpiryJob] Released ${updated} stale dataset lock(s).`);
  }

  return updated;
};

// ─── Main cron runner ─────────────────────────────────────────────────────────
export const startBookingExpiryCron = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const [completed, unpaid, suspended, locks] = await Promise.all([
        expireCompletedBookings(),
        expireUnpaidBookings(),
        enforceContinuousAccessLimit(),
        releaseExpiredLocks(),
      ]);

      if (completed || unpaid || suspended || locks) {
        console.log(
          `[ExpiryJob] Run complete — ` +
          `completed: ${completed}, unpaidExpired: ${unpaid}, ` +
          `accessSuspended: ${suspended}, locksReleased: ${locks}`
        );
      }
    } catch (err) {
      console.error(" Booking expiry cron error:", err);
    }
  });

  console.log(" Booking expiry cron started");
};