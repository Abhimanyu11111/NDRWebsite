import Room from "../models/Room.js";
import { isPositiveInt, isInEnum, validationError } from "../utils/validators.js";

const ROOM_TYPES = ["OALP", "DSF", "CBM", "GENERAL"];

/* ============================
   GET ALL ROOMS (ADMIN)
============================ */
export const getRoomsAdmin = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { is_active: true },
      order: [["id", "DESC"]],
    });
    res.json({ success: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch rooms" });
  }
};

/* ============================
   CREATE NEW ROOM
============================ */
export const createRoom = async (req, res) => {
  try {
    const {
      title,
      name,
      description,
      capacity,
      hourly_rate,
      half_day_rate,
      full_day_rate,
      license_type,
      room_type,
    } = req.body;
    const roomTitle = String(title || name || "").trim().slice(0, 150);

    if (!roomTitle) {
      return res.status(400).json({ success: false, message: "Room title required" });
    }
    if (room_type && !isInEnum(room_type, ROOM_TYPES)) {
      return res.status(400).json(validationError(`room_type must be one of: ${ROOM_TYPES.join(", ")}`));
    }

    const toNonNegativeNumber = (value) => {
      const num = Number(value);
      return Number.isFinite(num) && num >= 0 ? num : 0;
    };

    const room = await Room.create({
      title: roomTitle,
      description: description ? String(description).trim().slice(0, 1000) : null,
      capacity: capacity ? toNonNegativeNumber(capacity) : null,
      hourly_rate: toNonNegativeNumber(hourly_rate),
      half_day_rate: toNonNegativeNumber(half_day_rate),
      full_day_rate: toNonNegativeNumber(full_day_rate),
      license_type: license_type ? String(license_type).trim().slice(0, 100) : null,
      room_type: room_type || "GENERAL",
      is_active: true,
    });

    res.json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create room" });
  }
};

/* ============================
   DELETE ROOM
============================ */
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isPositiveInt(id)) {
      return res.status(400).json(validationError("id must be a positive integer"));
    }
    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    await room.update({ is_active: false });

    res.json({ success: true, message: "Room deactivated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete room" });
  }
};
