const db = require("../config/db");

const FAQModel = {
  initializeTable: () => {
    const sql = `
      DROP TABLE IF EXISTS faq;

      CREATE TABLE IF NOT EXISTS faq (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    db.query(sql, (err) => {
      if (err) console.error("FAQ Table creation error:", err);
      else console.log("FAQ table recreated ✔");
    });
  },
};

FAQModel.initializeTable();

module.exports = FAQModel;
