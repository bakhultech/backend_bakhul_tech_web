// models/WebsiteInfoModel.js
const { getDB } = require("../config/db");

const WebsiteInfoModel = {};

// ================= CREATE TABLE =================
WebsiteInfoModel.initializeTable = async () => {
  try {
    const db = await getDB();

    const sql = `
      CREATE TABLE IF NOT EXISTS website_info (
        primary_id INT PRIMARY KEY,
        email VARCHAR(255),
        phone VARCHAR(50),
        education_email VARCHAR(255),
        address TEXT,
        footerText TEXT,
        facebook VARCHAR(255),
        instagram VARCHAR(255),
        youtube VARCHAR(255),
        linkedin VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.query(sql);
    console.log("✅ website_info table created / ensured");
  } catch (error) {
    console.error("❌ website_info table error:", error.message);
  }
};

// ================= INSERT DEFAULT ROW =================
WebsiteInfoModel.insertDefault = async () => {
  try {
    const db = await getDB();

    const [rows] = await db.query(
      "SELECT primary_id FROM website_info WHERE primary_id = 1"
    );

    if (rows.length === 0) {
      const insertSql = `
        INSERT INTO website_info 
        (primary_id, email, phone, education_email, address, footerText, facebook, instagram, youtube, linkedin)
        VALUES (1, '', '', '', '', '', '', '', '', '')
      `;

      await db.query(insertSql);
      console.log("✅ Default website_info row inserted");
    }
  } catch (error) {
    console.error("❌ website_info default insert error:", error.message);
  }
};

module.exports = WebsiteInfoModel;
