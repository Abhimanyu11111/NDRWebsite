import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { express as useragentMiddleware } from "express-useragent";

import { startBookingExpiryCron } from "./cron/bookingExpiryCron.js";
import sequelize from "./src/config/db.js";
import './models/associations.js';

// ROUTES
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
import registrationRoutes from './routes/registrationRoutes.js';
import blockRoutes from './routes/blockRoutes.js'; // 👈 NEW IMPORT

const app = express();

// MIDDLEWARES
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(useragentMiddleware());

// STATIC FILES
app.use("/invoices", express.static("invoices"));

// API ROUTES
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
app.use('/api/user', userRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/blocks', blockRoutes); // 👈 NEW ROUTE

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync();
    console.log("✅ Models synced successfully");

    // Start cron job
    startBookingExpiryCron();
    console.log("✅ Booking expiry cron started");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();