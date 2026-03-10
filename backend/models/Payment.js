import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    order_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    booking_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },

    status: {
      type: DataTypes.ENUM("INITIATED", "SUCCESS", "FAILED"),
      defaultValue: "INITIATED",
    },

    ccavenue_response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Payment;