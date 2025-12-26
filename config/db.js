// config/db.js
const mysql = require("mysql2/promise");

let pool;

async function createPool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,

    // 🔥 IMPORTANT FIX FOR RAILWAY
    ssl: {
      rejectUnauthorized: false, // <-- THIS FIXES self-signed cert error
    },
  });

  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Connected Successfully");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL initial connection failed:", err.message);
    throw err; // fail fast if DB not reachable
  }

  return pool;
}

async function getDB() {
  if (!pool) {
    await createPool();
  }
  return pool;
}

module.exports = { getDB };
