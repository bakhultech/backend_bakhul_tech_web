const db = require("../config/db");

// Create slug from name
function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "-");
}

// ====================== GET ALL CATEGORIES ======================
exports.getBlogCategories = (req, res) => {
  const detectColumnQuery = `
    SHOW COLUMNS FROM blogs LIKE 'category_id'
  `;

  db.query(detectColumnQuery, (err, colResult) => {
    let categoryColumn = "category_id";

    if (!colResult || colResult.length === 0) {
      categoryColumn = null;
    }

    const sql = categoryColumn
      ? `
        SELECT c.*,
        (SELECT COUNT(*) FROM blogs b WHERE b.${categoryColumn} = c.primary_id) AS blogCount
        FROM blog_categories c
        ORDER BY primary_id DESC
      `
      : `
        SELECT c.*, 0 AS blogCount
        FROM blog_categories c
        ORDER BY primary_id DESC
      `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("CATEGORY LIST ERROR:", err);
        return res.json({ success: false, message: "Database Error" });
      }

      return res.json({
        success: true,
        data: result,
      });
    });
  });
};

// ====================== ADD / UPDATE CATEGORY ======================
exports.addBlogCategory = (req, res) => {
  const { name, primary_id } = req.body;

  if (!name?.trim()) {
    return res.json({ success: false, message: "Category name required" });
  }

  const slug = slugify(name);

  // 🔥 UPDATE CATEGORY
  if (primary_id) {
    const updateSql = `
      UPDATE blog_categories 
      SET name = ?, slug = ?
      WHERE primary_id = ?
    `;

    db.query(updateSql, [name, slug, primary_id], (err) => {
      if (err) {
        console.error("CATEGORY UPDATE ERROR:", err);
        return res.json({ success: false, message: "Update Failed" });
      }

      return res.json({
        success: true,
        message: "Category Updated Successfully",
      });
    });

    return;
  }

  // 🔥 ADD NEW CATEGORY
  const insertSql = `
    INSERT INTO blog_categories (name, slug)
    VALUES (?, ?)
  `;

  db.query(insertSql, [name, slug], (err) => {
    if (err) {
      console.error("CATEGORY ADD ERROR:", err);
      return res.json({ success: false, message: "Insert Failed" });
    }

    return res.json({
      success: true,
      message: "Category Added Successfully",
    });
  });
};

// ====================== DELETE CATEGORY ======================
exports.deleteBlogCategory = (req, res) => {
  const { primary_id } = req.body;

  if (!primary_id) {
    return res.json({ success: false, message: "primary_id is required" });
  }

  const sql = "DELETE FROM blog_categories WHERE primary_id = ?";

  db.query(sql, [primary_id], (err) => {
    if (err) {
      console.error("CATEGORY DELETE ERROR:", err);
      return res.json({ success: false, message: "Delete failed" });
    }

    return res.json({
      success: true,
      message: "Category Deleted Successfully",
    });
  });
};
