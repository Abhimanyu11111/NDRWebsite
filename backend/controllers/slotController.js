import { getSlotsByRoomAndDate } from "../models/slot.js";

export const getSlots = async (req, res) => {
  try {
    const { roomId, date } = req.query;
    const slots = await getSlotsByRoomAndDate(roomId, date);
    res.json(slots);
  } catch (err) {
    console.log("SLOT ERROR:", err);
    res.status(500).json({ message: "Error fetching slots" });
  }
};
