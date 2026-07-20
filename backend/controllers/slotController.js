import { getSlotsByRoomAndDate } from "../models/Slot.js";
import { isPositiveInt, isValidDateString, validationError } from "../utils/validators.js";

export const getSlots = async (req, res) => {
  try {
    const { roomId, date } = req.query;

    if (!isPositiveInt(roomId)) {
      return res.status(400).json(validationError("roomId must be a positive integer"));
    }
    if (!isValidDateString(date)) {
      return res.status(400).json(validationError("date must be a valid date"));
    }

    const slots = await getSlotsByRoomAndDate(roomId, date);
    res.json(slots);
  } catch (err) {
    console.log("SLOT ERROR:", err);
    res.status(500).json({ message: "Error fetching slots" });
  }
};
