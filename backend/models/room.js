import { db } from "../src/config/db.js";

export const getAllRooms = async () => {
  try {
    // 🔍 DEBUG START
    console.log("TEST DB QUERY RUNNING...");
    const [countRows] = await db.query("SELECT COUNT(*) AS total FROM rooms");
    console.log("ROOM COUNT:", countRows);
    // 🔍 DEBUG END

    const [rows] = await db.query("SELECT * FROM rooms");
    return rows;
  } catch (err) {
    console.log("ROOM DB ERROR:", err);
    throw err;
  }
};
