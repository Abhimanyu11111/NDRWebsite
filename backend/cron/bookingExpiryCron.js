import cron from "node-cron";
import Booking from "../models/Booking.js";
import { Op } from "sequelize";

/**
 * Runs every minute
 */
export const startBookingExpiryCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredBookings = await Booking.findAll({
        where: {
          status: "CONFIRMED",
          end_datetime: { [Op.lt]: now },
        },
      });

      for (const booking of expiredBookings) {
        booking.status = "COMPLETED";
        await booking.save();

        console.log(
          `Booking expired: ${booking.booking_id} at ${now.toISOString()}`
        );
      }
    } catch (err) {
      console.error("❌ Booking expiry cron error:", err);
    }
  });

  console.log("✅ Booking expiry cron started");
};