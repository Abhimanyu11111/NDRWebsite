/**
 * migrations/add_booking_enhancements.js
 *
 * Run once:  node migrations/add_booking_enhancements.js
 * Rollback:  node migrations/add_booking_enhancements.js down
 *
 * Adds:
 *   bookings         → half_day_slot, working_day_surcharge, payment_status,
 *                      payment_id, dataset_locked, first_accessed_at, access_suspended
 *   dataset_locks    → NEW TABLE
 */

import sequelize from "../src/config/db.js";
import { QueryInterface, DataTypes } from "sequelize";

const qi = sequelize.getQueryInterface();

async function up() {
  // ── 1. bookings table – new columns ─────────────────────────────────────
  const bookingCols = await qi.describeTable("bookings");

  const addIfMissing = async (column, definition) => {
    if (!bookingCols[column]) {
      await qi.addColumn("bookings", column, definition);
      console.log(`  ✅ bookings.${column} added`);
    } else {
      console.log(`  ⏭  bookings.${column} already exists`);
    }
  };

  await addIfMissing("half_day_slot", {
    type:      DataTypes.ENUM("AM", "PM"),
    allowNull: true,
    after:     "booking_type",
  });

  await addIfMissing("working_day_surcharge", {
    type:         DataTypes.DECIMAL(10, 2),
    allowNull:    false,
    defaultValue: 0,
    after:        "working_days",
  });

  await addIfMissing("payment_status", {
    type:         DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
    allowNull:    false,
    defaultValue: "PENDING",
    after:        "total_price",
  });

  await addIfMissing("payment_id", {
    type:      DataTypes.STRING(100),
    allowNull: true,
    after:     "payment_status",
  });

  await addIfMissing("dataset_locked", {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
    after:        "payment_id",
  });

  await addIfMissing("first_accessed_at", {
    type:      DataTypes.DATE,
    allowNull: true,
    comment:   "When user first accessed the room – 96h window starts here",
    after:     "dataset_locked",
  });

  await addIfMissing("access_suspended", {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
    comment:      "True when 96h continuous access window exhausted",
    after:        "first_accessed_at",
  });

  // ── 2. dataset_locks – new table ─────────────────────────────────────────
  const tables = await qi.showAllTables();

  if (!tables.includes("dataset_locks")) {
    await qi.createTable("dataset_locks", {
      id: {
        type:          DataTypes.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
      },
      dataset_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      booking_id: {
        type:      DataTypes.STRING(50),
        allowNull: false,
        references: { model: "bookings", key: "booking_id" },
        onDelete:   "CASCADE",
      },
      user_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
      },
      locked_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      expires_at: {
        type:      DataTypes.DATE,
        allowNull: false,
      },
      released_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type:         DataTypes.ENUM("ACTIVE", "RELEASED", "EXPIRED"),
        allowNull:    false,
        defaultValue: "ACTIVE",
      },
      created_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
    });

    await qi.addIndex("dataset_locks", ["dataset_id"]);
    await qi.addIndex("dataset_locks", ["booking_id"]);
    await qi.addIndex("dataset_locks", ["user_id", "status"]);
    await qi.addIndex("dataset_locks", ["expires_at"]);

    console.log("  ✅ dataset_locks table created");
  } else {
    console.log("  ⏭  dataset_locks table already exists");
  }

  console.log("\n✅ Migration complete.\n");
}

async function down() {
  await qi.dropTable("dataset_locks");
  await qi.removeColumn("bookings", "half_day_slot");
  await qi.removeColumn("bookings", "working_day_surcharge");
  await qi.removeColumn("bookings", "payment_status");
  await qi.removeColumn("bookings", "payment_id");
  await qi.removeColumn("bookings", "dataset_locked");
  await qi.removeColumn("bookings", "first_accessed_at");
  await qi.removeColumn("bookings", "access_suspended");
  console.log("✅ Rollback complete.");
}

const action = process.argv[2] === "down" ? down : up;
action()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });