import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";
import Booking from "./Booking.js";


const Slot = sequelize.define(
  "Slot",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "booked"),
      defaultValue: "available",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "slots",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// FUNCTION
export const getSlotsByRoomAndDate = async (roomId, date) => {
  return await Slot.findAll({
    where: {
      room_id: roomId,
      date,
      is_active: true,
    },
    order: [["start_time", "ASC"]],
  });
};


// Slot.hasMany(Booking, {
//   foreignKey: "room_id",
//   as: "bookings"
// });

// DEFAULT EXPORT
export default Slot;
