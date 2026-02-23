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

    //  NEW – AM or PM for HALF_DAY bookings
    half_day_slot: {
      type: DataTypes.ENUM("AM", "PM"),
      allowNull: true,
      comment: "Required when booking_type = HALF_DAY",
    },

    /* Slot-based core fields */
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

    /* Legacy fields (kept for compatibility) */
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date:   { type: DataTypes.DATEONLY, allowNull: true },
    start_time: { type: DataTypes.TIME,     allowNull: true },
    end_time:   { type: DataTypes.TIME,     allowNull: true },

    //  Working days – auto-calculated on create/update
    working_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    //  NEW – surcharge for working days beyond free limit
    working_day_surcharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Extra charge when working days exceed MAX_FREE_WORKING_DAYS",
    },

    data_catalogue: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Selected dataset IDs (array)",
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

    //  NEW – payment tracking fields
    payment_status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    //  NEW – dataset locked flag (set after payment success)
    dataset_locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    //  NEW – 4-day continuous access tracking
    first_accessed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp of first room/data access; 96h window starts here",
    },

    access_suspended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "True when 96h continuous access window is exhausted",
    },

    status: {
      type: DataTypes.ENUM("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "EXPIRED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

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

/* Relations */
Booking.belongsTo(User, { foreignKey: "user_id", as: "user" });
Booking.belongsTo(Room, { foreignKey: "room_id", as: "room" });

export default Booking;