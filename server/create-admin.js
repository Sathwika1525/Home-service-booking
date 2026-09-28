
const pool = require("./db");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    const username = "admin";
    const password = "ChangeThis123!";

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (username, password_hash)
       VALUES ($1, $2)`,
      [username, hashedPassword]
    );

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();