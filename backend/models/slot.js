import { db } from "../src/config/db.js";

export const getSlotsByRoomAndDate = async (roomId, date) => {
  const [rows] = await db.query(
    "SELECT * FROM slots WHERE room_id = ? AND date = ?",
    [roomId, date]
  );
  return rows;
};

export const getFullBookedDates = async (roomId) => {
  const [rows] = await db.query(
    `SELECT date
     FROM slots
     WHERE room_id = ?
     GROUP BY date
     HAVING SUM(status = 'booked') = COUNT(*)`,
    [roomId]
  );
  return rows.map(r => r.date);
};

export const getAvailableDates = async (roomId) => {
  const [rows] = await db.query(
    `SELECT DISTINCT date
     FROM slots
     WHERE room_id = ?
     AND status = 'available'`,
    [roomId]
  );
  return rows.map(r => r.date);
};
