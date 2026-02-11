import sequelize from "../src/config/db.js";

/* ============================
   GET ALL ROOMS (ADMIN)
============================ */
export const getRoomsAdmin = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM rooms ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

/* ============================
   CREATE NEW ROOM
============================ */
export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room name required" });
    }

    const [result] = await sequelize.query(
      "INSERT INTO rooms (name) VALUES (?)",
      {
        replacements: [name],
      }
    );

    res.json({
      message: "Room created successfully",
      roomId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create room" });
  }
};

/* ============================
   DELETE ROOM
============================ */
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // delete linked slots first
    await sequelize.query(
      "DELETE FROM slots WHERE room_id = ?",
      { replacements: [id] }
    );

    // delete the room
    await sequelize.query(
      "DELETE FROM rooms WHERE id = ?",
      { replacements: [id] }
    );

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete room" });
  }
};
