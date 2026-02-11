import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";
import User from "./User.js";
import Room from "./room.js";

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    booking_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    booking_type: {
      type: DataTypes.ENUM("HOURLY", "HALF_DAY", "FULL_DAY", "MULTI_DAY"),
      allowNull: false,
      defaultValue: "FULL_DAY",
    },

    /* 🔥 SLOT-BASED CORE FIELDS (NEW) */
    start_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /* 🟡 OLD FIELDS (DEPRECATED – keep for now) */
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    working_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    data_catalogue: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Selected data sets",
    },

    room_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    data_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    weekend_notice: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    /* 🟡 LEGACY (logic ab status + datetime se hoga) */
    is_blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

/* RELATIONS */
Booking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Booking.belongsTo(Room, {
  foreignKey: "room_id",
  as: "room",
});

export default Booking;