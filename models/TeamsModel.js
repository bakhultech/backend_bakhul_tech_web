// models/TeamsModel.js
const { getDB } = require("../config/db");

const TeamsModel = {};

// ================= CREATE TABLE =================
TeamsModel.initializeTable = async () => {
  try {
    const db = await getDB();

    const sql = `
      CREATE TABLE IF NOT EXISTS teams (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        profile_img VARCHAR(255),
        status TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.query(sql);
    console.log("✅ teams table created / ensured");
  } catch (error) {
    console.error("❌ teams table error:", error.message);
  }
};

module.exports = TeamsModel;
