// models/ContactModel.js
const { getDB } = require("../config/db");

const ContactModel = {};

// ================= CREATE TABLE =================
ContactModel.initializeTable = async () => {
  try {
    const db = await getDB();

    const sql = `
      CREATE TABLE IF NOT EXISTS contact_info (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        number VARCHAR(50),
        query TEXT,
        country VARCHAR(100),
        city VARCHAR(100),
        company VARCHAR(255),
        subject VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.query(sql);
    console.log("✅ contact_info table ready");
  } catch (error) {
    console.error("❌ contact_info table error:", error.message);
  }
};

module.exports = ContactModel;
