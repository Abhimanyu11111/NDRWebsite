import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { express as useragentMiddleware } from "express-useragent";

//  ADD
import { startBookingExpiryCron } from "./cron/bookingExpiryCron.js";

import sequelize from "./src/config/db.js";

// ROUTES (unchanged)
import roomRoutes from "./routes/roomRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import roomAdminRoutes from "./routes/roomAdminRoutes.js";
import slotAdminRoutes from "./routes/slotAdminRoutes.js";
import userAdminRoutes from "./routes/userAdminRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //  REQUIRED
app.use(useragentMiddleware());

// OPTIONAL
app.use("/invoices", express.static("invoices"));

// ROUTES (same as before)
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/admin/rooms", roomAdminRoutes);
app.use("/api/admin/slots", slotAdminRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api", userAdminRoutes);
// app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Database connected");

    await sequelize.sync();
    console.log(" Models synced");

    //  START CRON
    startBookingExpiryCron();

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();