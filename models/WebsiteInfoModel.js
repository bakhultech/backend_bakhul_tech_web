const db = require("../config/db");

const WebsiteInfoModel = {
  initializeTable: () => {
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
        linkedin VARCHAR(255),                    -- LinkedIn added
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    db.query(sql, (err) => {
      if (err) {
        console.error("Table creation error:", err);
      } else {
        console.log("website_info table created/ensured with LinkedIn");
      }
    });
  },

  insertDefault: () => {
    const checkSql = "SELECT * FROM website_info WHERE primary_id = 1";

    db.query(checkSql, (err, result) => {
      if (err) {
        console.error("Check error:", err);
        return;
      }

      if (result.length === 0) {
        const insertSql = `
          INSERT INTO website_info 
          (primary_id, email, phone, education_email, address, footerText, facebook, instagram, youtube, linkedin)
          VALUES (1, '', '', '', '', '', '', '', '', '')
        `;

        db.query(insertSql, (err) => {
          if (err) console.error("Default insert error:", err);
          else console.log("Default website_info row created with LinkedIn");
        });
      }
    });
  },
};

// Run both
WebsiteInfoModel.initializeTable();
WebsiteInfoModel.insertDefault();

module.exports = WebsiteInfoModel;
