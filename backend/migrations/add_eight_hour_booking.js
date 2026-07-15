/**
 * Adds EIGHT_HOUR to bookings.booking_type without changing existing rows.
 * Legacy values remain valid so historical bookings can still be read/updated.
 * Run once during deployment: node migrations/add_eight_hour_booking.js
 */
import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";

const run = async () => {
  const qi = sequelize.getQueryInterface();
  const columns = await qi.describeTable("bookings");

  if (!columns.booking_type) {
    throw new Error("bookings.booking_type does not exist");
  }

  await qi.changeColumn("bookings", "booking_type", {
    type: DataTypes.ENUM("HOURLY", "HALF_DAY", "FULL_DAY", "MULTI_DAY", "EIGHT_HOUR"),
    allowNull: false,
    defaultValue: "MULTI_DAY",
  });

  console.log("bookings.booking_type now preserves legacy values and supports EIGHT_HOUR");
};

run()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error("8-hour booking migration failed:", error);
    await sequelize.close();
    process.exit(1);
  });
