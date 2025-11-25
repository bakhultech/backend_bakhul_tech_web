const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true,
});

// --------- AUTO CREATE DATABASE ---------
connection.query(
  `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
  (err) => {
    if (err) {
      console.log("❌ DB Create Error:", err);
    } else {
      console.log("✅ Database Created / Already Exists");
    }
  }
);

// --------- CONNECT DATABASE ---------
connection.changeUser({ database: process.env.DB_NAME }, (err) => {
  if (err) {
    console.log("DB Select Error:", err);
  } else {
    console.log("Using Database:", process.env.DB_NAME);
  }
});

module.exports = connection;
