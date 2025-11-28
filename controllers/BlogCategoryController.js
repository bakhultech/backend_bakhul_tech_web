const db = require("../config/db");

// Create slug from name
function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "-");
}

// ====================== GET ALL CATEGORIES ======================
exports.getBlogCategories = (req, res) => {
  const sql = `
    SELECT 
      c.*,
      (
        SELECT COUNT(*) 
        FROM blogs b 
        WHERE b.category IS NOT NULL 
          AND b.category != '[]' 
          AND JSON_CONTAINS(b.category, JSON_QUOTE(c.slug))
      ) AS blogCount
    FROM blog_categories c
    ORDER BY c.primary_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("CATEGORY LIST ERROR:", err);
      return res.json({ success: false, message: "Database Error" });
    }
    res.json({ success: true, data: result });
  });
};

// ====================== ADD / UPDATE CATEGORY ======================
exports.addBlogCategory = (req, res) => {
  const { name, primary_id } = req.body;

  if (!name?.trim()) {
    return res.json({ success: false, message: "Category name required" });
  }

  const slug = slugify(name);

  // 🔥 UPDATE
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

  // 🔥 ADD NEW
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

  // STEP 1: Get slug of category to delete
  const getSlugSql = "SELECT slug FROM blog_categories WHERE primary_id = ?";
  db.query(getSlugSql, [primary_id], (err, rows) => {
    if (err || rows.length === 0) {
      return res.json({ success: false, message: "Category not found" });
    }

    const slug = rows[0].slug;

    // STEP 2: Remove this slug from all blogs
    const updateBlogsSql = `
      UPDATE blogs
      SET category = JSON_REMOVE(category, JSON_UNQUOTE(JSON_SEARCH(category, 'one', ?)))
      WHERE JSON_CONTAINS(category, JSON_QUOTE(?))
    `;

    db.query(updateBlogsSql, [slug, slug], (err2) => {
      if (err2) {
        console.error("CATEGORY CLEAN ERROR:", err2);
      }

      // STEP 3: Delete category
      const deleteSql = "DELETE FROM blog_categories WHERE primary_id = ?";
      db.query(deleteSql, [primary_id], (err3) => {
        if (err3) {
          return res.json({ success: false, message: "Delete failed" });
        }

        return res.json({
          success: true,
          message: "Category Deleted & Blogs Updated",
        });
      });
    });
  });
};
