import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Room from "../models/room.js";
import Payment from "../models/payment.js";
import Notification from "../models/Notification.js";
import DatasetLock from "../models/DatasetLock.js";
import { Op } from "sequelize";
import sequelize from "../src/config/db.js";

/* =====================================================
   GET /admin/dashboard/counts
   Main stats + recent bookings + revenue chart
===================================================== */
export const getDashboardCounts = async (req, res) => {
  try {
    const now       = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days  = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, activeUsers,
      totalRooms, activeRooms,
      totalBookings, confirmedBookings,
      pendingBookings, cancelledBookings,
      revenueData, todayRevenue,
      pendingPayments, failedPayments,
      activeDatasetLocks,
      recentBookings,
      revenueChart,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { is_active: true } }),
      Room.count(),
      Room.count({ where: { is_active: true } }),
      Booking.count(),
      Booking.count({ where: { status: "CONFIRMED" } }),
      Booking.count({ where: { status: "PENDING" } }),
      Booking.count({ where: { status: "CANCELLED" } }),

      // Total revenue from successful payments
      Payment.sum("amount", { where: { status: "SUCCESS" } }),

      // Today's revenue
      Payment.sum("amount", {
        where: { status: "SUCCESS", created_at: { [Op.gte]: todayStart } },
      }),

      // Pending payments (bookings not yet paid)
      Booking.count({
        where: { status: "PENDING", payment_status: "PENDING" },
      }),

      // Failed payments
      Payment.count({ where: { status: "FAILED" } }),

      // Active dataset locks
      DatasetLock.count({ where: { status: "ACTIVE", expires_at: { [Op.gt]: now } } }),

      // Recent bookings with user + room
      Booking.findAll({
        limit: 20,
        order: [["created_at", "DESC"]],
        include: [
          { model: User, as: "user", attributes: ["name", "email"] },
          { model: Room, as: "room", attributes: ["title"] },
        ],
      }),

      // Revenue last 7 days (for bar chart)
      sequelize.query(
        `SELECT 
           DATE(p.created_at) AS date,
           SUM(p.amount)      AS revenue,
           COUNT(*)           AS transactions
         FROM payments p
         WHERE p.status = 'SUCCESS'
           AND p.created_at >= :since
         GROUP BY DATE(p.created_at)
         ORDER BY date ASC`,
        {
          replacements: { since: last7Days },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
    ]);

    // Format recent bookings
    const formattedBookings = recentBookings.map((b) => ({
      id:                   b.id,
      booking_id:           b.booking_id,
      userName:             b.user?.name   || "—",
      userEmail:            b.user?.email  || "—",
      roomTitle:            b.room?.title  || "—",
      booking_type:         b.booking_type,
      half_day_slot:        b.half_day_slot,
      start_datetime:       b.start_datetime,
      end_datetime:         b.end_datetime,
      working_days:         b.working_days,
      working_day_surcharge: b.working_day_surcharge,
      total_price:          b.total_price,
      payment_status:       b.payment_status,
      status:               b.status,
      created_at:           b.created_at,
    }));

    // Fill missing days in chart (last 7 days, even if no revenue)
    const chartMap = {};
    revenueChart.forEach((r) => { chartMap[r.date] = r.revenue; });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      chartData.push({
        label:   d.toLocaleDateString("en-IN", { weekday: "short" }),
        date:    key,
        revenue: parseFloat(chartMap[key] || 0),
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers:        activeUsers   || 0,
        totalRooms,
        activeRooms:        activeRooms   || 0,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue:       parseFloat(revenueData  || 0),
        todayRevenue:       parseFloat(todayRevenue || 0),
        pendingPayments:    pendingPayments  || 0,
        failedPayments:     failedPayments   || 0,
        activeDatasetLocks: activeDatasetLocks || 0,
      },
      recentBookings: formattedBookings,
      revenueChart:   chartData,
    });
  } catch (err) {
    console.error("Dashboard counts error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};

/* =====================================================
   GET /admin/notifications?limit=20
===================================================== */
export const getAdminNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page  = parseInt(req.query.page)  || 1;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findAll({
      order:  [["created_at", "DESC"]],
      limit,
      offset,
      include: [{ model: User, as: "user", attributes: ["name", "email"] }],
    });

    const unreadCount = await Notification.count({ where: { is_read: false } });

    res.json({
      success: true,
      notifications: notifications.map((n) => ({
        id:         n.id,
        message:    n.message,
        type:       n.type || "GENERAL",
        is_read:    n.is_read,
        room_id:    n.room_id,
        user:       n.user ? { name: n.user.name, email: n.user.email } : null,
        created_at: n.created_at,
      })),
      unreadCount,
    });
  } catch (err) {
    console.error("Notifications fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

/* =====================================================
   PATCH /admin/notifications/:id/read
===================================================== */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });

    notif.is_read = true;
    await notif.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

/* =====================================================
   PATCH /admin/notifications/read-all
===================================================== */
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { is_read: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
};

/* =====================================================
   GET /admin/bookings?status=PENDING&type=WEEKEND
===================================================== */
export const getAdminBookings = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20, room_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (room_id) where.room_id = room_id;

    // Weekend pending filter
    if (type === "WEEKEND") {
      where.weekend_notice = { [Op.ne]: null };
      where.status = "PENDING";
    }

    const { count, rows } = await Booking.findAndCountAll({
      where,
      limit:   parseInt(limit),
      offset,
      order:   [["created_at", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["name", "email", "phone"] },
        { model: Room, as: "room", attributes: ["title"] },
      ],
    });

    res.json({
      success: true,
      bookings: rows.map((b) => ({
        booking_id:           b.booking_id,
        userName:             b.user?.name  || "—",
        userEmail:            b.user?.email || "—",
        userPhone:            b.user?.phone || "—",
        roomTitle:            b.room?.title || "—",
        booking_type:         b.booking_type,
        half_day_slot:        b.half_day_slot,
        start_datetime:       b.start_datetime,
        end_datetime:         b.end_datetime,
        working_days:         b.working_days,
        working_day_surcharge: b.working_day_surcharge,
        total_price:          b.total_price,
        weekend_notice:       b.weekend_notice,
        status:               b.status,
        payment_status:       b.payment_status,
        created_at:           b.created_at,
      })),
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    console.error("Admin bookings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

/* =====================================================
   PATCH /admin/bookings/:id/status
   Approve / Reject booking
===================================================== */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const allowed = ["CONFIRMED", "CANCELLED", "PENDING", "COMPLETED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(", ")}` });
    }

    const booking = await Booking.findOne({ where: { booking_id: id } });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = status;
    await booking.save();

    // Create notification for user
    await Notification.create({
      user_id:  booking.user_id,
      room_id:  booking.room_id,
      message:  `Your booking ${id} has been ${status.toLowerCase()} by admin.`,
      type:     "BOOKING",
      is_read:  false,
      is_active: true,
    });

    res.json({ success: true, message: `Booking ${status.toLowerCase()} successfully` });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ success: false, message: "Failed to update booking status" });
  }
};

/* =====================================================
   GET /admin/payments?status=FAILED&limit=10
===================================================== */
export const getAdminPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      limit:  parseInt(limit),
      offset,
      order:  [["created_at", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["name", "email"] },
      ],
    });

    // For each failed payment, count total failures for that booking
    const payments = await Promise.all(
      rows.map(async (p) => {
        const fail_count = await Payment.count({
          where: { booking_id: p.booking_id, status: "FAILED" },
        });
        return {
          order_id:   p.order_id,
          booking_id: p.booking_id,
          userName:   p.user?.name  || "—",
          userEmail:  p.user?.email || "—",
          amount:     p.amount,
          currency:   p.currency,
          status:     p.status,
          fail_count,
          created_at: p.created_at,
        };
      })
    );

    res.json({
      success: true,
      payments,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    console.error("Admin payments error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

/* =====================================================
   GET /admin/dataset-locks
===================================================== */
export const getDatasetLocks = async (req, res) => {
  try {
    const { status = "ACTIVE", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await DatasetLock.findAndCountAll({
      where,
      limit:  parseInt(limit),
      offset,
      order:  [["locked_at", "DESC"]],
      include: [
        { model: Booking, as: "booking", include: [{ model: User, as: "user", attributes: ["name", "email"] }] },
      ],
    });

    res.json({
      success: true,
      locks: rows.map((l) => ({
        id:         l.id,
        dataset_id: l.dataset_id,
        booking_id: l.booking_id,
        user_id:    l.user_id,
        userName:   l.booking?.user?.name  || "—",
        userEmail:  l.booking?.user?.email || "—",
        locked_at:  l.locked_at,
        expires_at: l.expires_at,
        status:     l.status,
      })),
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    console.error("Dataset locks error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dataset locks" });
  }
};