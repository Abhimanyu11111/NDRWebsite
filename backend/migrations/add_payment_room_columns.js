/**
 * migrations/add_payment_room_columns.js
 *
 * Run once:  node migrations/add_payment_room_columns.js
 * Rollback:  node migrations/add_payment_room_columns.js down
 *
 * Ensures production schema contains the columns expected by current models:
 *   payments -> transaction_status, payment_method
 *   rooms    -> license_type, room_type
 */

import sequelize from "../src/config/db.js";
import { DataTypes } from "sequelize";

const qi = sequelize.getQueryInterface();

async function addColumnIfMissing(tableName, columns, columnName, definition) {
  if (!columns[columnName]) {
    await qi.addColumn(tableName, columnName, definition);
    console.log(`  added ${tableName}.${columnName}`);
    return;
  }

  console.log(`  skipped ${tableName}.${columnName} (already exists)`);
}

async function up() {
  const paymentCols = await qi.describeTable("payments");
  await addColumnIfMissing("payments", paymentCols, "transaction_status", {
    type: DataTypes.STRING(100),
    allowNull: true,
  });
  await addColumnIfMissing("payments", paymentCols, "payment_method", {
    type: DataTypes.STRING(100),
    allowNull: true,
  });

  const roomCols = await qi.describeTable("rooms");
  await addColumnIfMissing("rooms", roomCols, "license_type", {
    type: DataTypes.STRING(100),
    allowNull: true,
  });
  await addColumnIfMissing("rooms", roomCols, "room_type", {
    type: DataTypes.ENUM("OALP", "DSF", "CBM", "GENERAL"),
    allowNull: false,
    defaultValue: "GENERAL",
  });

  console.log("\nSchema sync complete.\n");
}

async function down() {
  const paymentCols = await qi.describeTable("payments");
  if (paymentCols.transaction_status) {
    await qi.removeColumn("payments", "transaction_status");
    console.log("  removed payments.transaction_status");
  }
  if (paymentCols.payment_method) {
    await qi.removeColumn("payments", "payment_method");
    console.log("  removed payments.payment_method");
  }

  const roomCols = await qi.describeTable("rooms");
  if (roomCols.license_type) {
    await qi.removeColumn("rooms", "license_type");
    console.log("  removed rooms.license_type");
  }
  if (roomCols.room_type) {
    await qi.removeColumn("rooms", "room_type");
    console.log("  removed rooms.room_type");
  }

  console.log("\nRollback complete.\n");
}

const action = process.argv[2] === "down" ? down : up;
action()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
