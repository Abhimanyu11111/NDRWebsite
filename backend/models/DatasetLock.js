import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";
import Booking from "./Booking.js";

const DatasetLock = sequelize.define(
  "DatasetLock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    dataset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Foreign key to datasets table",
    },

    booking_id: {
      type: DataTypes.STRING(50),  // matches Booking.booking_id (STRING)
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    locked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "When access window closes (matches booking end_datetime)",
    },

    released_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "RELEASED", "EXPIRED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "dataset_locks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["dataset_id"] },
      { fields: ["booking_id"] },
      { fields: ["user_id"] },
      { fields: ["status"] },
      { fields: ["expires_at"] },
    ],
  }
);

/* Relations */
DatasetLock.belongsTo(Booking, { foreignKey: "booking_id", targetKey: "booking_id", as: "booking" });
Booking.hasMany(DatasetLock,  { foreignKey: "booking_id", sourceKey: "booking_id", as: "datasetLocks" });

export default DatasetLock;