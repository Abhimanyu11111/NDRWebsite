/**
 * Adds users.country and widens users.pincode for international registration.
 * The server also applies this automatically on start-up; running it manually
 * is optional: node migrations/add_user_country.js
 */
import "../src/config/env.js";
import sequelize from "../src/config/db.js";
import { ensureUserLocationSchema } from "../src/config/userLocationSchema.js";

ensureUserLocationSchema(sequelize)
  .then(async (result) => {
    console.log("User location schema:", result);
    await sequelize.close();
    if (!result.countrySupported) process.exit(1);
  })
  .catch(async (error) => {
    console.error("User location migration failed:", error);
    await sequelize.close();
    process.exit(1);
  });
