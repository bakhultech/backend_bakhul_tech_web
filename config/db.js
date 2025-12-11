const mysql = require("mysql2");

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
};

const connection = mysql.createPool(config);

connection.getConnection((err, conn) => {
  if (err) {
    console.log("❌ MySQL Connection Error:", err.message);
  } else {
    console.log(
      `✅ MySQL Connected (host: ${config.host}, db: ${config.database})`
    );
    conn.release();
  }
});

module.exports = connection;
