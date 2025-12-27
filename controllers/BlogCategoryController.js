// ================================================
// BLOG CATEGORY CONTROLLER (PROMISE SAFE - FINAL)
// ================================================

const { getDB } = require("../config/db");

// ---------------- SLUGIFY ----------------
function slugify(str) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ---------------- ENSURE TABLE ----------------
async function ensureTableExists() {
  try {
    const db = await getDB();

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS blog_categories (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await db.query(createTableSql);
  } catch (err) {
    console.error("❌ blog_categories table error:", err.message);
    throw err;
  }
}

// ================= GET ALL =================
exports.getBlogCategories = async (req, res) => {
  try {
    // ✅ ensure table before query
    await ensureTableExists();

    const db = await getDB();

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

    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET BLOG CATEGORY ERROR:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= ADD / UPDATE =================
exports.addBlogCategory = async (req, res) => {
  try {
    // ✅ ensure table before any operation
    await ensureTableExists();

    // ✅ HARD GUARD
    const body = req.body && typeof req.body === "object" ? req.body : {};

    let name = body.name;
    let primary_id = body.primary_id;

    // 🛡 safety for array cases
    if (Array.isArray(name)) name = name[0];
    if (Array.isArray(primary_id)) primary_id = primary_id[0];

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name required",
      });
    }

    name = name.trim();
    const slug = slugify(name);
    const db = await getDB();

    /* ================= UPDATE ================= */
    if (primary_id) {
      await db.query(
        "UPDATE blog_categories SET name=?, slug=? WHERE primary_id=?",
        [name, slug, primary_id]
      );

      return res.json({
        success: true,
        message: "Category updated successfully!",
      });
    }

    /* ================= DUPLICATE CHECK ================= */
    const [exist] = await db.query(
      "SELECT primary_id FROM blog_categories WHERE slug=?",
      [slug]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category already exists!",
      });
    }

    /* ================= INSERT ================= */
    const [result] = await db.query(
      "INSERT INTO blog_categories (name, slug) VALUES (?,?)",
      [name, slug]
    );

    res.json({
      success: true,
      message: "Category added successfully!",
      data: {
        primary_id: result.insertId,
        name,
        slug,
      },
    });
  } catch (err) {
    console.error("ADD BLOG CATEGORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= DELETE =================
exports.deleteBlogCategory = async (req, res) => {
  try {
    // ✅ ensure table exists
    await ensureTableExists();

    const body = req.body && typeof req.body === "object" ? req.body : {};
    let primary_id = body.primary_id;

    if (Array.isArray(primary_id)) primary_id = primary_id[0];

    if (!primary_id) {
      return res.status(400).json({
        success: false,
        message: "primary_id required",
      });
    }

    const db = await getDB();

    const [rows] = await db.query(
      "SELECT slug FROM blog_categories WHERE primary_id=?",
      [primary_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const slug = rows[0].slug;

    // cleanup blogs
    await db.query(
      `
      UPDATE blogs
      SET category = JSON_REMOVE(
        category,
        JSON_UNQUOTE(JSON_SEARCH(category, 'one', ?))
      )
      WHERE JSON_CONTAINS(category, JSON_QUOTE(?))
      `,
      [slug, slug]
    );

    // delete category
    await db.query(
      "DELETE FROM blog_categories WHERE primary_id=?",
      [primary_id]
    );

    res.json({
      success: true,
      message: "Category deleted successfully!",
    });
  } catch (err) {
    console.error("DELETE BLOG CATEGORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= EXPORT INIT =================
exports.initializeTable = ensureTableExists;
