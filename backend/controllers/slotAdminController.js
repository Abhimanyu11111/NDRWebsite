import sequelize from "../src/config/db.js";
import {
  isPositiveInt,
  isValidDateString,
  isValidTimeString,
  validationError,
} from "../utils/validators.js";

/* ============================
   GET ALL SLOTS FOR A ROOM
============================ */
export const getSlotsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!isPositiveInt(roomId)) {
      return res.status(400).json(validationError("roomId must be a positive integer"));
    }

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
    if (!isPositiveInt(room_id)) {
      return res.status(400).json(validationError("room_id must be a positive integer"));
    }
    if (!isValidDateString(date)) {
      return res.status(400).json(validationError("date must be a valid date"));
    }
    if (!isValidTimeString(start_time) || !isValidTimeString(end_time)) {
      return res.status(400).json(validationError("start_time and end_time must be HH:MM (24-hour) times"));
    }
    if (start_time >= end_time) {
      return res.status(400).json(validationError("end_time must be after start_time"));
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

    if (!isPositiveInt(slotId)) {
      return res.status(400).json(validationError("slotId must be a positive integer"));
    }
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

    if (!isPositiveInt(slotId)) {
      return res.status(400).json(validationError("slotId must be a positive integer"));
    }

    const [result] = await sequelize.query(
      "DELETE FROM slots WHERE id = ?",
      {
        replacements: [slotId],
      }
    );
    if (!result?.affectedRows) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete slot" });
  }
};
