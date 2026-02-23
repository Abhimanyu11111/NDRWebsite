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
        is_active,
        company,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    //  Normalize – frontend expects is_active field
    const users = rows.map((u) => ({
      ...u,
      is_active: Boolean(u.is_active),
      //  Also provide status string for backward compatibility
      status: u.is_active ? "Active" : "Inactive",
    }));

    res.json({ success: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};

/**
 * UPDATE USER STATUS (active / blocked)
 * /api/admin/users/:id/status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expects "Active" or "Inactive"

    //  Map status string → is_active boolean
    const isActive = status === "Active" ? 1 : 0;

    await sequelize.query(
      "UPDATE users SET is_active = ? WHERE id = ?",
      { replacements: [isActive, id] }
    );

    res.json({ success: true, message: "User status updated successfully" });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};