import "./src/config/env.js";

import express from "express";
import cors from "cors";
import { express as useragentMiddleware } from "express-useragent";
import {
  blockUnsafeMethods,
  corsOptions,
  rejectRequestSmuggling,
  requireHttpsInProduction,
  securityHeaders,
  validateRequestPayload,
} from "./middleware/security.js";
import { rateLimit } from "./middleware/rateLimit.js";

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
import blockRoutes from './routes/blockRoutes.js'; 

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_PER_MINUTE || 120),
  keyPrefix: "api",
  includeEmail: false,
  message: "Too many requests. Please slow down and try again shortly.",
});

// Short-window burst guard — catches rapid request flooding (scripted
// hammering / DoS-style bursts) that a per-minute window alone is too
// coarse to stop quickly.
const burstLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: Number(process.env.API_BURST_LIMIT_PER_10S || 30),
  keyPrefix: "burst",
  includeEmail: false,
  message: "Too many requests in a short period. Please slow down.",
});

// MIDDLEWARES
app.use(requireHttpsInProduction);
app.use(rejectRequestSmuggling);
app.use(blockUnsafeMethods);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(validateRequestPayload);
app.use(useragentMiddleware());

// STATIC FILES
app.use("/invoices", express.static("invoices"));

// API ROUTES
app.use("/api", burstLimiter, apiLimiter);
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
app.use('/api/blocks', blockRoutes);

// 404 — generic message, no stack/route fingerprinting details
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// Global error handler — never leak stack traces or framework/version info
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Database connected successfully");

    await sequelize.sync();
    console.log(" Models synced successfully");

    // Start cron job
    startBookingExpiryCron();
    console.log(" Booking expiry cron started");

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
