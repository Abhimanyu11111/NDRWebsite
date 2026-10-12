/**
 * International registration needs two schema changes on `users`:
 *   - a nullable `country` column (existing rows are backfilled to "India",
 *     since registration only accepted Indian phone numbers until now)
 *   - `pincode` widened from 6 to 12 characters for international postal codes
 *
 * Deploys only `git pull` + restart, so this runs on every server start and is
 * idempotent. It never throws: if a step fails (e.g. no ALTER permission) the
 * app keeps working the old way instead of every `users` query failing.
 */
import { DataTypes } from "sequelize";
import User from "../../models/User.js";

const POSTAL_CODE_LENGTH = 12;

export const userLocationSchema = {
  countrySupported: false,
  postalCodeMaxLength: 6,
};

const columnLength = (column) =>
  Number((String(column?.type || "").match(/\((\d+)\)/) || [])[1] || 0);

export const ensureUserLocationSchema = async (sequelize) => {
  const qi = sequelize.getQueryInterface();

  try {
    let columns = await qi.describeTable("users");

    if (!columns.country) {
      await qi.addColumn("users", "country", { type: DataTypes.STRING(100), allowNull: true });
      await sequelize.query("UPDATE users SET country = 'India' WHERE country IS NULL");
      console.log(" users.country column added (existing users set to India)");
    }

    if (columns.pincode && columnLength(columns.pincode) < POSTAL_CODE_LENGTH) {
      await qi.changeColumn("users", "pincode", {
        type: DataTypes.STRING(POSTAL_CODE_LENGTH),
        allowNull: true,
      });
      console.log(` users.pincode widened to ${POSTAL_CODE_LENGTH} characters`);
    }

    columns = await qi.describeTable("users");
    userLocationSchema.countrySupported = Boolean(columns.country);
    userLocationSchema.postalCodeMaxLength = columnLength(columns.pincode) || 6;
  } catch (error) {
    console.error(" User location schema update failed – international fields disabled:", error.message);
  }

  if (!userLocationSchema.countrySupported) {
    // Keep every User query working without the column.
    User.removeAttribute("country");
  }

  return userLocationSchema;
};
