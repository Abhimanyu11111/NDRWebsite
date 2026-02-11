import sequelize from "../src/config/db.js";

/**
 * GET ALL USERS (Admin)
 * /api/admin/users
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        status,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * UPDATE USER STATUS (active / blocked)
 * /api/admin/users/:id/status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await sequelize.query(
      "UPDATE users SET status = ? WHERE id = ?",
      {
        replacements: [status, id],
      }
    );

    res.json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};
