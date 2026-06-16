import Room from "../models/Room.js";

/* ============================
   GET ALL ROOMS (ADMIN)
============================ */
export const getRoomsAdmin = async (req, res) => {
  try {
    const rooms = await Room.findAll({ order: [["id", "DESC"]] });
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
    const roomTitle = String(title || name || "").trim();

    if (!roomTitle) {
      return res.status(400).json({ success: false, message: "Room title required" });
    }

    const room = await Room.create({
      title: roomTitle,
      description: description || null,
      capacity: capacity || null,
      hourly_rate: hourly_rate || 0,
      half_day_rate: half_day_rate || 0,
      full_day_rate: full_day_rate || 0,
      license_type: license_type || null,
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
