/**
 * Creates the persistent registration-email OTP table.
 * Run once during deployment: node migrations/create_registration_email_otps.js
 */
import sequelize from "../src/config/db.js";
import RegistrationOtp from "../models/RegistrationOtp.js";

const run = async () => {
  await sequelize.authenticate();
  await RegistrationOtp.sync();
  console.log("Registration email OTP table is ready");
};

run()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error("Registration email OTP migration failed:", error);
    await sequelize.close();
    process.exit(1);
  });
