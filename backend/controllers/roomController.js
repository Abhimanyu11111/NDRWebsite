import Room from "../models/Slot.js";

/**
 * Get all active rooms
 */
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { is_active: true },
      attributes: [
        "id",
        "title",
        "description",
        "capacity",
        "hourly_rate",
        "half_day_rate",
        "full_day_rate"
      ],
      order: [["title", "ASC"]]
    });

    return res.status(200).json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error("Get all rooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message
    });
  }
};

/**
 * Get room by ID
 */
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    return res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    console.error("Get room by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room",
      error: error.message
    });
  }
};

/**
 * Create new room (Admin only)
 */
const createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      capacity,
      hourly_rate,
      half_day_rate,
      full_day_rate
    } = req.body;

    if (!title || !hourly_rate || !half_day_rate || !full_day_rate) {
      return res.status(400).json({
        success: false,
        message: "Title and all rate fields are required"
      });
    }

    const room = await Room.create({
      title,
      description: description || null,
      capacity: capacity || null,
      hourly_rate,
      half_day_rate,
      full_day_rate,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room
    });
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message
    });
  }
};

/**
 * Update room (Admin only)
 */
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      capacity,
      hourly_rate,
      half_day_rate,
      full_day_rate,
      is_active
    } = req.body;

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    if (title !== undefined) room.title = title;
    if (description !== undefined) room.description = description;
    if (capacity !== undefined) room.capacity = capacity;
    if (hourly_rate !== undefined) room.hourly_rate = hourly_rate;
    if (half_day_rate !== undefined) room.half_day_rate = half_day_rate;
    if (full_day_rate !== undefined) room.full_day_rate = full_day_rate;
    if (is_active !== undefined) room.is_active = is_active;

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room
    });
  } catch (error) {
    console.error("Update room error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message
    });
  }
};

/**
 * Delete room (Admin only)
 */
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    room.is_active = false;
    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message
    });
  }
};

/**
 * DEFAULT EXPORT (VERY IMPORTANT)
 */
export default {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
