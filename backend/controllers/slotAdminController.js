import sequelize from "../src/config/db.js";

/* ============================
   GET ALL SLOTS FOR A ROOM
============================ */
export const getSlotsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const [rows] = await sequelize.query(
      "SELECT * FROM slots WHERE room_id = ? ORDER BY date, start_time",
      {
        replacements: [roomId],
      }
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch slots" });
  }
};

/* ============================
   CREATE SLOT
============================ */
export const createSlot = async (req, res) => {
  try {
    const { room_id, date, start_time, end_time } = req.body;

    if (!room_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await sequelize.query(
      `INSERT INTO slots
       (room_id, date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'available')`,
      {
        replacements: [room_id, date, start_time, end_time],
      }
    );

    res.json({
      message: "Slot created successfully",
      slotId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add slot" });
  }
};

/* ============================
   UPDATE SLOT STATUS
============================ */
export const updateSlotStatus = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;

    if (!["available", "booked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await sequelize.query(
      "UPDATE slots SET status = ? WHERE id = ?",
      {
        replacements: [status, slotId],
      }
    );

    res.json({ message: "Slot updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update slot" });
  }
};

/* ============================
   DELETE SLOT
============================ */
export const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    await sequelize.query(
      "DELETE FROM slots WHERE id = ?",
      {
        replacements: [slotId],
      }
    );

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete slot" });
  }
};
