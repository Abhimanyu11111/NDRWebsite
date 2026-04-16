import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";
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
      type: DataTypes.ENUM("FULL_DAY", "MULTI_DAY"),  // ✅ UPDATED: Removed HOURLY, HALF_DAY, ONE_WEEK
      allowNull: false,
      defaultValue: "FULL_DAY",
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

    working_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    working_day_surcharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Extra charge when working days exceed MAX_FREE_WORKING_DAYS",
    },

    // ✅ NEW FIELDS
    license_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Selected license type (DSG/Petrel/etc)"
    },

    room_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Room type at booking time"
    },

    block_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Designated block/area for data access"
    },

    data_catalogue: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Selected dataset IDs (array)",
    },

    // ✅ UPDATED: Separate fields for better querying
    data_category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    data_subcategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    data_requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
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

    payment_status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    dataset_locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

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
      defaultValue: false,
    },
  },
  {
    tableName: "bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Booking;
