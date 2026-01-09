import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mysql from "mysql2";
import requestIp from "request-ip";
import { express as useragentMiddleware } from "express-useragent";
import fetch from "node-fetch"; // GEO lookup

const app = express();
app.use(cors());
app.use(express.json());
app.use(useragentMiddleware());


// DB CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) console.log("DB Error:", err);
  else console.log("MySQL Connected");
});

// TEST ROUTE
app.get("/api/test", (req, res) => {
  res.send("Backend Working!");
});

// CONTACT FORM API
app.post("/api/contact", (req, res) => {
  const { full_name, email, message } = req.body;

  if (!full_name || !email || !message) {
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  const query = "INSERT INTO contact_form (full_name, email, message) VALUES (?, ?, ?)";

  db.query(query, [full_name, email, message], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ success: false, error: err });
    }
    return res.send({ success: true, message: "Message submitted successfully!" });
  });
});

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

  // Simple validation
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

  db.query(
    query,
    [title, full_name, email, phone, job_title, org_type, org_name, street, country, state, city, comments],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ success: false, error: err });
      }
      return res.send({ success: true, message: "Registration saved successfully!" });
    }
  );
});


// INCREASE VISITOR COUNT
app.post("/api/visitor/increment", (req, res) => {
  db.query("UPDATE visitor_count SET total = total + 1 WHERE id = 1", (err) => {
    if (err) return res.status(500).send({ success: false, error: err });

    db.query("SELECT total FROM visitor_count WHERE id = 1", (err, result) => {
      if (err) return res.status(500).send({ success: false, error: err });
      return res.send({ success: true, total: result[0].total });
    });
  });
});

// GET VISITOR COUNT
app.get("/api/visitor", (req, res) => {
  db.query("SELECT total FROM visitor_count WHERE id = 1", (err, result) => {
    if (err) return res.status(500).send({ success: false, error: err });
    return res.send({ success: true, total: result[0].total });
  });
});


// 🟢 SAVE VISITOR DETAILS (IP + GEO + DEVICE + BROWSER)
app.post("/api/visitor/log", async (req, res) => {
  try {
    // Get IP
    const ip = requestIp.getClientIp(req) || "Unknown";

    // Device info
    const ua = req.useragent;
    const device = ua.isMobile ? "Mobile" : ua.isDesktop ? "Desktop" : "Other";
    const browser = ua.browser || "Unknown";

    // Default geo
    let country = "Unknown";
    let city = "Unknown";

    // Lookup geo from IP
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

    // Insert log in DB
    const query = `
      INSERT INTO visitor_logs (ip, country, city, device, browser)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [ip, country, city, device, browser], (err) => {
      if (err) return res.status(500).send({ success: false, error: err });
      return res.send({ success: true });
    });

  } catch (err) {
    return res.status(500).send({ success: false, error: err });
  }
});


app.listen(5000, () => console.log("Server started on port 5000"));
