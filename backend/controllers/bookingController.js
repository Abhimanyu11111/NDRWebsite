import { db } from "../src/config/db.js";

// BOOK SLOT
export const bookSlot = async (req, res) => {
  try {
    const { room_id, slot_id, user_name, user_email, user_phone, user_org, amount } = req.body;

    // Check if slot free
    const [slotCheck] = await db.query("SELECT status FROM slots WHERE id=?", [slot_id]);
    if (!slotCheck.length || slotCheck[0].status !== "available") {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // Create booking
    const [result] = await db.query(
      "INSERT INTO bookings (room_id, slot_id, user_name, user_email, user_phone, user_org, amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [room_id, slot_id, user_name, user_email, user_phone, user_org, amount]
    );

    // Lock slot
    await db.query("UPDATE slots SET status='booked' WHERE id=?", [slot_id]);

    return res.status(200).json({ bookingId: result.insertId });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Booking failed" });
  }
};

// FULLY BOOKED DAYS
export const getFullBookedDates = async (req, res) => {
  try {
    const { roomId } = req.query;

    const [rows] = await db.query(
      `SELECT date
       FROM slots
       WHERE room_id=?
       GROUP BY date
       HAVING SUM(status='booked') = COUNT(*)`,
      [roomId]
    );

    res.json(rows.map(r => r.date));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

// AVAILABLE DATES
export const getAvailableDates = async (req, res) => {
  try {
    const { roomId } = req.query;

    const [rows] = await db.query(
      `SELECT date
       FROM slots
       WHERE room_id=?
       GROUP BY date
       HAVING SUM(status='available') > 0`,
      [roomId]
    );

    res.json(rows.map(r => r.date));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const getAllBookingsAdmin = (req, res) => {
  db.query("SELECT * FROM bookings", (err, rows) => {
    if (err) return res.status(500).json({ msg: err.message });
    res.json(rows);
  });
};

