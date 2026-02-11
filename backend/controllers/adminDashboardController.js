import sequelize from "../src/config/db.js";

export const getDashboardCounts = async (req, res) => {
  try {
    const [[users]] = await sequelize.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    const [[rooms]] = await sequelize.query(
      "SELECT COUNT(*) AS totalRooms FROM rooms"
    );

    const [[bookings]] = await sequelize.query(
      "SELECT COUNT(*) AS totalBookings FROM bookings"
    );

    const [[activeUsers]] = await sequelize.query(
      "SELECT COUNT(*) AS activeUsers FROM users WHERE is_active: true"
    );

    res.json({
      totalUsers: users.totalUsers,
      totalRooms: rooms.totalRooms,
      totalBookings: bookings.totalBookings,
      activeUsers: activeUsers.activeUsers,
    });
  } catch (error) {
    console.error("Dashboard count error:", error);
    res.status(500).json({ message: "Dashboard data failed" });
  }
};
