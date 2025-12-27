// models/BlogModel.js
const { getDB } = require("../config/db");

const BlogModel = {};

BlogModel.initializeTable = async () => {
  try {
    const db = await getDB();

    // 1. Create table (safe)
    await db.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) DEFAULT NULL,
        subtitle TEXT DEFAULT NULL,
        author VARCHAR(255) DEFAULT NULL,
        category TEXT DEFAULT NULL,
        shortDesc TEXT DEFAULT NULL,
        fullDesc LONGTEXT DEFAULT NULL,
        coverImg VARCHAR(255) DEFAULT NULL,
        blogImg VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ================= COLUMN FIXES =================

    // 2. Ensure subtitle is TEXT (🔥 FIX)
    const [subtitleType] = await db.query(`
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME='blogs' AND COLUMN_NAME='subtitle'
    `);

    if (subtitleType.length && subtitleType[0].DATA_TYPE !== "text") {
      await db.query(`
        ALTER TABLE blogs MODIFY subtitle TEXT DEFAULT NULL
      `);
    }

    // 3. Ensure slug column
    const [slugCol] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME='blogs' AND COLUMN_NAME='slug'
    `);
    if (slugCol.length === 0) {
      await db.query(`
        ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER title
      `);
    }

    // 4. Ensure author column
    const [authorCol] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME='blogs' AND COLUMN_NAME='author'
    `);
    if (authorCol.length === 0) {
      await db.query(`
        ALTER TABLE blogs ADD COLUMN author VARCHAR(255) DEFAULT NULL AFTER subtitle
      `);
    }

    // 5. Ensure category is TEXT
    const [catType] = await db.query(`
      SELECT DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME='blogs' AND COLUMN_NAME='category'
    `);
    if (catType.length && catType[0].DATA_TYPE !== "text") {
      await db.query(`
        ALTER TABLE blogs MODIFY category TEXT DEFAULT NULL
      `);
    }

    // ================= SEO FIELDS =================

    // 6. metaTitle
    const [metaTitleCol] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME='blogs' AND COLUMN_NAME='metaTitle'
    `);
    if (metaTitleCol.length === 0) {
      await db.query(`
        ALTER TABLE blogs ADD COLUMN metaTitle VARCHAR(255) DEFAULT NULL AFTER title
      `);
    }

    // 7. metaDescription
    const [metaDescCol] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME='blogs' AND COLUMN_NAME='metaDescription'
    `);
    if (metaDescCol.length === 0) {
      await db.query(`
        ALTER TABLE blogs ADD COLUMN metaDescription TEXT DEFAULT NULL AFTER metaTitle
      `);
    }

    console.log("✅ blogs table updated (subtitle TEXT, SEO fields safe)");
  } catch (error) {
    console.error("❌ blogs table error:", error.message);
  }
};

module.exports = BlogModel;
