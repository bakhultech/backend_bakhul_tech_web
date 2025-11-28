const db = require("../config/db");

const BlogModel = {
  initializeTable: () => {
    const createTable = `
      CREATE TABLE IF NOT EXISTS blogs (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) DEFAULT NULL, 
        subtitle VARCHAR(255) DEFAULT NULL,
        author VARCHAR(255) DEFAULT NULL,
        category TEXT DEFAULT NULL,
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

      // ========== CHECK IF slug COLUMN EXISTS ==========
      const checkSlugColumn = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'blogs' AND COLUMN_NAME = 'slug'
      `;

      db.query(checkSlugColumn, (err, result) => {
        if (err) {
          console.error("SLUG COLUMN CHECK ERROR:", err);
          return;
        }

        if (result.length === 0) {
          console.log("Slug column missing — adding now...");

          const addSlugSql = `
            ALTER TABLE blogs 
            ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER title
          `;

          db.query(addSlugSql, (err) => {
            if (err) {
              console.error("ADD SLUG COLUMN ERROR:", err);
            } else {
              console.log("Slug column added successfully ✔");
            }
          });
        }
      });

      // ========== CHECK IF category COLUMN TYPE IS TEXT ==========
      const checkCategoryColumn = `
        SELECT DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'blogs' AND COLUMN_NAME = 'category'
      `;

      db.query(checkCategoryColumn, (err, result) => {
        if (err) {
          console.error("CATEGORY TYPE CHECK ERROR:", err);
          return;
        }

        if (result.length > 0 && result[0].DATA_TYPE !== "text") {
          console.log("Updating category column to TEXT...");

          const alterCategorySql = `
            ALTER TABLE blogs MODIFY category TEXT DEFAULT NULL
          `;

          db.query(alterCategorySql, (err) => {
            if (err) {
              console.error("CATEGORY ALTER ERROR:", err);
            } else {
              console.log("Category column updated to TEXT ✔");
            }
          });
        }
      });

      // ========== CHECK COLUMN "author" EXISTS OR NOT ==========
      const checkAuthorColumn = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'blogs' AND COLUMN_NAME = 'author'
      `;

      db.query(checkAuthorColumn, (err, result) => {
        if (err) {
          console.error("AUTHOR COLUMN CHECK ERROR:", err);
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
              console.error("ADD AUTHOR COLUMN ERROR:", err);
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
