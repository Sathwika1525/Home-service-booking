require("dotenv").config();

const pool = require("./db");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    const username = "admin";
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error("ADMIN_PASSWORD is missing in .env");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [username, hashedPassword]
    );

    console.log("Admin password updated successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();