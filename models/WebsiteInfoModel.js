const db = require("../config/db");

const WebsiteInfoModel = {
  initializeTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS website_info (
        primary_id INT PRIMARY KEY,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        footerText TEXT,
        facebook VARCHAR(255),
        instagram VARCHAR(255),
        youtube VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    db.query(sql, (err) => {
      if (err) console.error("Table creation error:", err);
    });
  },

  insertDefault: () => {
    const sqlCheck = "SELECT * FROM website_info WHERE primary_id = 1";

    db.query(sqlCheck, (err, result) => {
      if (err) return console.error(err);

      if (result.length === 0) {
        const sqlInsert = `
          INSERT INTO website_info 
          (primary_id, email, phone, address, footerText, facebook, instagram, youtube) 
          VALUES (1, '', '', '', '', '', '', '')
        `;

        db.query(sqlInsert, (err2) => {
          if (err2) console.error("Default insert error:", err2);
          else console.log("Default website_info row created ✔");
        });
      }
    });
  },
};

WebsiteInfoModel.initializeTable();
WebsiteInfoModel.insertDefault();

module.exports = WebsiteInfoModel;
