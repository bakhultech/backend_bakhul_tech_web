// models/LoginModel.js
const { getDB } = require("../config/db");
const bcrypt = require("bcryptjs");

const LoginModel = {};

// ================= CREATE TABLE =================
LoginModel.initializeTable = async () => {
  try {
    const db = await getDB();

    const sql = `
      CREATE TABLE IF NOT EXISTS AdminLogin (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db.query(sql);
    console.log("✅ AdminLogin table ready");
  } catch (error) {
    console.error("❌ AdminLogin table error:", error.message);
  }
};

// ================= INSERT DEFAULT ADMIN =================
LoginModel.insertDefault = async () => {
  try {
    const db = await getDB();

    const email = "admin@bakhultech.com";
    const password = "bakhultech@2341";

    const [rows] = await db.query(
      "SELECT primary_id FROM AdminLogin WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query(
        "INSERT INTO AdminLogin (email, password, role) VALUES (?, ?, ?)",
        [email, hashed, "admin"]
      );
      console.log("✅ Default admin user created");
    }
  } catch (error) {
    console.error("❌ Default admin insert error:", error.message);
  }
};

// ================= GET USER BY EMAIL =================
LoginModel.getUserByEmail = async (email) => {
  const db = await getDB();
  const [rows] = await db.query(
    "SELECT * FROM AdminLogin WHERE email = ?",
    [email]
  );
  return rows;
};

module.exports = LoginModel;
