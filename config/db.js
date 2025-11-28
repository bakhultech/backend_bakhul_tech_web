require("dotenv").config();
const mysql = require("mysql2");

// Just for render/git detection 👇 (safe change)
console.log("🔧 Loading MySQL Connection Using ENV Variables...");

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test Connection
connection.getConnection((err, conn) => {
  if (err) {
    console.log("❌ MySQL Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected Successfully!");
    conn.release();
  }
});

module.exports = connection;
