require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyAdminToken = require("./middleware");

const app = express();

// CORS configuration for Vercel frontend
app.use(
  cors({
    origin: "https://homeservicebooking-bice.vercel.app",
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Home Service Booking API is running!" });
});

// Get all services
app.get("/api/services", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM services ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Admin bookings API - Protected with JWT
app.get(
  "/api/admin/bookings",
  verifyAdminToken,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          b.id,
          b.customer_name,
          b.customer_phone,
          s.service_name,
          b.start_at,
          b.end_at,
          b.price,
          b.status
        FROM bookings b
        JOIN services s ON b.service_id = s.service_id
        ORDER BY b.start_at ASC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        error: "Failed to fetch bookings.",
      });
    }
  }
);

// Cancel booking
app.patch(
  "/api/admin/bookings/:id/cancel",
  verifyAdminToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE bookings
         SET status = 'cancelled'
         WHERE id = $1 AND status = 'confirmed'
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Booking not found or already cancelled",
        });
      }

      res.json({
        message: "Booking cancelled successfully",
        booking: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to cancel booking",
      });
    }
  }
);

// Admin login API
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required.",
      });
    }

    const result = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Admin login successful!",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Login failed.",
    });
  }
});

// Create a booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      service_id,
      customer_name,
      customer_phone,
      booking_date,
      start_time,
    } = req.body;

    if (
      !service_id ||
      !customer_name?.trim() ||
      !customer_phone?.trim() ||
      !booking_date ||
      !start_time
    ) {
      return res.status(400).json({
        error: "Please provide all required booking details.",
      });
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(booking_date) ||
      !/^\d{2}:\d{2}$/.test(start_time)
    ) {
      return res.status(400).json({
        error: "Invalid date or time format.",
      });
    }

    const [year, month, day] = booking_date.split("-").map(Number);
    const [hour, minute] = start_time.split(":").map(Number);

    if (
      month < 1 || month > 12 ||
      day < 1 || day > 31 ||
      hour < 0 || hour > 23 ||
      minute < 0 || minute > 59
    ) {
      return res.status(400).json({
        error: "Invalid date or time.",
      });
    }

    const startAt = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0
    );

    if (
      startAt.getFullYear() !== year ||
      startAt.getMonth() !== month - 1 ||
      startAt.getDate() !== day
    ) {
      return res.status(400).json({
        error: "Please select a valid date.",
      });
    }

    if (startAt <= new Date()) {
      return res.status(400).json({
        error: "Please select a future date and time.",
      });
    }

    // Get service duration and price from database
    const serviceResult = await pool.query(
      `SELECT service_id, duration_minutes, base_price
       FROM services
       WHERE service_id = $1`,
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found.",
      });
    }

    const service = serviceResult.rows[0];

    // Calculate end time
    const endAt = new Date(
      startAt.getTime() +
        Number(service.duration_minutes) * 60 * 1000
    );

    // Working hours: 9 AM to 6 PM
    const openingTime = 9 * 60;
    const closingTime = 18 * 60;
    const startMinutes = hour * 60 + minute;
    const endMinutes = endAt.getHours() * 60 + endAt.getMinutes();

    if (
      startMinutes < openingTime ||
      endMinutes > closingTime
    ) {
      return res.status(400).json({
        error: "Booking must start after 9:00 AM and finish by 6:00 PM.",
      });
    }

    // Get an active technician
    const technicianResult = await pool.query(
      `SELECT id FROM technicians
       WHERE is_active = TRUE
       ORDER BY id
       LIMIT 1`
    );

    if (technicianResult.rows.length === 0) {
      return res.status(400).json({
        error: "No technician is currently available.",
      });
    }

    const technicianId = technicianResult.rows[0].id;

    // Insert booking
    const bookingResult = await pool.query(
      `INSERT INTO bookings
        (service_id, technician_id, customer_name, customer_phone,
         start_at, end_at, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [
        service.service_id,
        technicianId,
        customer_name.trim(),
        customer_phone.trim(),
        startAt,
        endAt,
        service.base_price,
      ]
    );

    res.status(201).json({
      message: "Booking created successfully!",
      booking: bookingResult.rows[0],
    });
  } catch (error) {
    if (error.code === "23P01") {
      return res.status(409).json({
        error: "This time slot is already booked. Please choose another time.",
      });
    }

    console.error(error.message);
    res.status(500).json({
      error: "Failed to create booking.",
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});