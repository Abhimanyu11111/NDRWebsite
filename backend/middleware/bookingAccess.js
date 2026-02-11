import Booking from "../models/Booking.js";
import { Op } from "sequelize";

const bookingAccess = async (req, res, next) => {
  const userId = req.user.id;

  const activeBooking = await Booking.findOne({
    where: {
      user_id: userId,
      status: "CONFIRMED",
      start_datetime: { [Op.lte]: new Date() },
      end_datetime: { [Op.gte]: new Date() },
    },
  });

  if (!activeBooking) {
    return res.status(403).json({
      success: false,
      message: "Your booking has expired",
    });
  }

  next();
};

export default bookingAccess;