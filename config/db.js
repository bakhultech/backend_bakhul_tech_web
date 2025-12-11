// config/db.js
const mysql = require("mysql2");

// ===================== CONFIG =====================
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false,
  multipleStatements: true
};

// ===================== CREATE POOL =====================
const db = mysql.createPool(config);

// ===================== CHECK INITIAL CONNECTION =====================
db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ MySQL Connection Failed");
    console.log("➡ Error:", err.message);
    console.log("➡ Host:", config.host);
    console.log("➡ Database:", config.database);
  } else {
    console.log(`✅ MySQL Connected Successfully (Host: ${config.host}, DB: ${config.database})`);
    connection.release();
  }
});

module.exports = db;
