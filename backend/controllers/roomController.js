import { getAllRooms } from "../models/room.js";

export const getRooms = async (req, res) => {
  try {
    const rooms = await getAllRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
};
