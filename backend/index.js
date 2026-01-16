import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import requestIp from "request-ip";
import { express as useragentMiddleware } from "express-useragent";
import fetch from "node-fetch";

// SINGLE DB POOL FOR ALL APIs
import { db } from "./src/config/db.js";

// ROUTES (new API)
import roomRoutes from "./routes/roomRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use(useragentMiddleware());
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);


// --- NEW VDR ROUTES ---
app.use("/api/rooms", roomRoutes);
app.use("/api/slots", slotRoutes);

// TEST ROUTE
app.get("/api/test", (req, res) => {
  res.send("Backend Working!");
});

// -------------------------------
// OLD CONTACT FORM 
// -------------------------------
app.post("/api/contact", (req, res) => {
  const { full_name, email, message } = req.body;

  if (!full_name || !email || !message) {
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  const query = "INSERT INTO contact_form (full_name, email, message) VALUES (?, ?, ?)";

  db.query(query, [full_name, email, message])
    .then(() => res.send({ success: true, message: "Message submitted successfully!" }))
    .catch(err => {
      console.log(err);
      res.status(500).send({ success: false, error: err });
    });
});

// -----------------------------------
//  REGISTRATION FORM 
// -----------------------------------
app.post("/api/register", (req, res) => {
  const {
    title,
    full_name,
    email,
    phone,
    job_title,
    org_type,
    org_name,
    street,
    country,
    state,
    city,
    comments
  } = req.body;

  if (!full_name || !email || !phone || !country || !state || !city) {
    return res.status(400).send({
      success: false,
      message: "Required fields missing"
    });
  }

  const query = `
    INSERT INTO registrations 
    (title, full_name, email, phone, job_title, org_type, org_name, street, country, state, city, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    title, full_name, email, phone, job_title, org_type, org_name,
    street, country, state, city, comments
  ])
    .then(() => res.send({ success: true, message: "Registration saved successfully!" }))
    .catch(err => {
      console.log(err);
      res.status(500).send({ success: false, error: err });
    });
});

// --------------------------
// VISITOR COUNTER 
// --------------------------
app.post("/api/visitor/increment", (req, res) => {
  db.query("UPDATE visitor_count SET total = total + 1 WHERE id = 1")
    .then(() => db.query("SELECT total FROM visitor_count WHERE id = 1"))
    .then(([rows]) => res.send({ success: true, total: rows[0].total }))
    .catch(err => res.status(500).send({ success: false, error: err }));
});

// --------------------------
// GET VISITOR COUNT
// --------------------------
app.get("/api/visitor", (req, res) => {
  db.query("SELECT total FROM visitor_count WHERE id = 1")
    .then(([rows]) => res.send({ success: true, total: rows[0].total }))
    .catch(err => res.status(500).send({ success: false, error: err }));
});

// ------------------------------
// VISITOR LOGGING 
// ------------------------------
app.post("/api/visitor/log", async (req, res) => {
  try {
    const ip = requestIp.getClientIp(req) || "Unknown";
    const ua = req.useragent;
    const device = ua.isMobile ? "Mobile" : ua.isDesktop ? "Desktop" : "Other";
    const browser = ua.browser || "Unknown";

    let country = "Unknown";
    let city = "Unknown";

    if (ip && ip !== "::1" && ip !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          country = geoData.country || "Unknown";
          city = geoData.city || "Unknown";
        }
      } catch (err) {
        console.log("Geo lookup failed");
      }
    }

    const query = `
      INSERT INTO visitor_logs (ip, country, city, device, browser)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(query, [ip, country, city, device, browser]);
    res.send({ success: true });

  } catch (err) {
    res.status(500).send({ success: false, error: err });
  }
});

app.listen(5000, () => console.log("Server started on port 5000"));
