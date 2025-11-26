const db = require("../config/db");

const BlogModel = {
  initializeTable: () => {
    const createTable = `

      CREATE TABLE IF NOT EXISTS blogs (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT NULL,
        author VARCHAR(255) DEFAULT NULL,
        category VARCHAR(255) DEFAULT NULL,
        shortDesc TEXT DEFAULT NULL,
        fullDesc LONGTEXT DEFAULT NULL,
        coverImg VARCHAR(255) DEFAULT NULL,
        blogImg VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.query(createTable, (err) => {
      if (err) {
        console.error("Blogs Table Create Error:", err);
        return;
      }
      console.log("Blogs table ready ✔");

      // ========== CHECK COLUMN "author" EXISTS OR NOT ==========
      const checkColumnSql = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'blogs' AND COLUMN_NAME = 'author'
      `;

      db.query(checkColumnSql, (err, result) => {
        if (err) {
          console.error("COLUMN CHECK ERROR:", err);
          return;
        }

        if (result.length === 0) {
          console.log("Author column missing — adding now...");

          const alterSql = `
            ALTER TABLE blogs 
            ADD COLUMN author VARCHAR(255) DEFAULT NULL AFTER subtitle
          `;

          db.query(alterSql, (err) => {
            if (err) {
              console.error("ADD COLUMN ERROR:", err);
            } else {
              console.log("Author column added successfully ✔");
            }
          });
        }
      });
    });
  },
};

module.exports = BlogModel;
