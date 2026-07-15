/**
 * Adds secure, expiring password-reset state to users.
 * Run once during deployment: node migrations/add_password_reset_fields.js
 */
import { DataTypes } from "sequelize";
import sequelize from "../src/config/db.js";

const run = async () => {
  const qi = sequelize.getQueryInterface();
  const columns = await qi.describeTable("users");

  if (!columns.password_reset_token_hash) {
    await qi.addColumn("users", "password_reset_token_hash", {
      type: DataTypes.STRING(64),
      allowNull: true,
    });
  }

  if (!columns.password_reset_expires_at) {
    await qi.addColumn("users", "password_reset_expires_at", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }

  if (!columns.password_reset_requested_at) {
    await qi.addColumn("users", "password_reset_requested_at", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }

  console.log("Password-reset fields are ready on users");
};

run()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error("Password-reset migration failed:", error);
    await sequelize.close();
    process.exit(1);
  });

