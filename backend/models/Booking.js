import { db } from "../src/config/db.js";

export const createBooking = async (room_id, slot_id, user_name, user_email, amount) => {
  const [result] = await db.query(
    "INSERT INTO bookings (room_id, slot_id, user_name, user_email, amount) VALUES (?, ?, ?, ?, ?)",
    [room_id, slot_id, user_name, user_email, amount]
  );
  return result.insertId;
};

export const lockSlot = async (slot_id) => {
  await db.query(
    "UPDATE slots SET status='booked' WHERE id=? AND status='available'",
    [slot_id]
  );
};

export const checkSlotAvailable = async (slot_id) => {
  const [rows] = await db.query(
    "SELECT status FROM slots WHERE id=?",
    [slot_id]
  );
  return rows[0]?.status === "available";
};
