import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";

const RegistrationOtp = sequelize.define("RegistrationOtp", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  otp_hash: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resend_available_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failed_attempts: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verification_token_hash: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  verification_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  consumed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "registration_email_otps",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { fields: ["expires_at"] },
    { fields: ["verification_expires_at"] },
  ],
});

export default RegistrationOtp;
