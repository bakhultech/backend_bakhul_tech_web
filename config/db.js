const mysql = require("mysql2");

// ===================== CONFIG =====================
const config = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASS || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "test",
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  multipleStatements: true,
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
    console.log(
      `✅ MySQL Connected Successfully (Host: ${config.host}, DB: ${config.database})`
    );
    connection.release();
  }
});

// Export pool
module.exports = db;
