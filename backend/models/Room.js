import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    half_day_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    full_day_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // ✅ NEW FIELDS
    license_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'License software type (DSG/Petrel/etc)'
    },

    room_type: {
      type: DataTypes.ENUM('OALP', 'DSF', 'CBM', 'GENERAL'),
      allowNull: false,
      defaultValue: 'GENERAL',
      comment: 'Type of data room'
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "rooms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Room;