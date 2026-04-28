import Notification from "../models/Notification.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import { Op } from "sequelize";

/**
 * Subscribe to slot availability notification
 */
export const subscribeToSlot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { room_id, startDate, endDate } = req.body;

    if (!room_id || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Room ID, start date, and end date are required",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const existingSubscription = await Notification.findOne({
      where: {
        user_id: userId,
        room_id,
        start_date: startDate,
        end_date: endDate,
        is_active: true,
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "You are already subscribed to this slot",
      });
    }

    const notification = await Notification.create({
      user_id: userId,
      room_id,
      start_date: startDate,
      end_date: endDate,
      user_email: user.email,
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: "You will be notified when this slot becomes available",
      subscription: {
        id: notification.id,
        room: room.title,
        start_date: notification.start_date,
        end_date: notification.end_date,
      },
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to subscribe",
      error: error.message,
    });
  }
};

/**
 * Get user's notification subscriptions
 */
export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await Notification.findAll({
      where: { user_id: userId, is_active: true },
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "title"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        room: s.room?.title,
        start_date: s.start_date,
        end_date: s.end_date,
        created_at: s.created_at,
      })),
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

/**
 * Unsubscribe from notification
 */
export const unsubscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription_id } = req.params;

    const notification = await Notification.findOne({
      where: { id: subscription_id, user_id: userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    notification.is_active = false;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unsubscribe",
      error: error.message,
    });
  }
};
                                                                                                                                        