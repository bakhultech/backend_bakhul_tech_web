// controllers/BlogController.js

const db = require("../config/db");

// Utility: slugify
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ================== GET ALL BLOGS OR SINGLE BLOG ==================
exports.getBlog = (req, res) => {
  const primary_id = req.body?.primary_id || null;

  let sql = `
    SELECT 
      b.*,
      GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names
    FROM blogs b
    LEFT JOIN blog_categories c 
      ON JSON_CONTAINS(b.category, JSON_QUOTE(c.slug))
  `;

  if (primary_id) sql += ` WHERE b.primary_id = ${db.escape(primary_id)}`;
  sql += ` GROUP BY b.primary_id ORDER BY b.primary_id DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ success: false, message: "Database Error" });
    }

    const finalData = result.map((item) => ({
      ...item,
      category: item.category ? JSON.parse(item.category) : [],
      category_names: item.category_names || "",
      coverImgFull: item.coverImg || null, // Cloudinary URL
      blogImgFull: item.blogImg || null, // Cloudinary URL
    }));

    return res.json({
      success: true,
      data: primary_id ? finalData[0] : finalData,
    });
  });
};

// ================== SAVE BLOG (ADD / UPDATE) ==================
exports.saveBlog = async (req, res) => {
  let { primary_id, title, subtitle, author, category, shortDesc, fullDesc } =
    req.body;

  const slug = slugify(title);

  let categorySlugs = [];

  // Parse categories
  if (category) {
    try {
      const catNames =
        typeof category === "string" ? JSON.parse(category) : category;
      const placeholders = catNames.map(() => "?").join(",");
      const slugSql = `SELECT slug FROM blog_categories WHERE name IN (${placeholders})`;

      const slugResult = await new Promise((resolve, reject) => {
        db.query(slugSql, catNames, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      categorySlugs = slugResult.map((row) => row.slug);
    } catch (e) {
      categorySlugs = [];
    }
  }

  const finalCategoryJson = JSON.stringify(categorySlugs);

  // Cloudinary URLs from route (NOT filenames)
  const coverImg = req.body.coverImg || null;
  const blogImg = req.body.blogImg || null;

  // ================= UPDATE BLOG =================
  if (primary_id) {
    const getOldSql = "SELECT coverImg, blogImg FROM blogs WHERE primary_id = ?";

    db.query(getOldSql, [primary_id], (err, data) => {
      if (err || !data.length) {
        return res.status(500).json({ success: false, message: "Blog not found" });
      }

      const finalCover = coverImg || data[0].coverImg;
      const finalBlog = blogImg || data[0].blogImg;

      const updateSql = `
        UPDATE blogs SET
          title=?, subtitle=?, author=?, category=?, 
          shortDesc=?, fullDesc=?, coverImg=?, blogImg=?, slug=?
        WHERE primary_id=?
      `;

      db.query(
        updateSql,
        [
          title,
          subtitle,
          author,
          finalCategoryJson,
          shortDesc,
          fullDesc,
          finalCover,
          finalBlog,
          slug,
          primary_id,
        ],
        (err) => {
          if (err) {
            console.error("UPDATE ERROR:", err);
            return res
              .status(500)
              .json({ success: false, message: "Update Failed" });
          }
          res.json({ success: true, message: "Blog Updated Successfully!" });
        }
      );
    });

    return;
  }

  // ================= ADD NEW BLOG =================
  const insertSql = `
    INSERT INTO blogs 
    (title, subtitle, author, category, shortDesc, fullDesc, coverImg, blogImg, slug) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertSql,
    [
      title,
      subtitle,
      author,
      finalCategoryJson,
      shortDesc,
      fullDesc,
      coverImg, // Cloudinary URL
      blogImg,  // Cloudinary URL
      slug,
    ],
    (err) => {
      if (err) {
        console.error("INSERT ERROR:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to add blog" });
      }
      res.json({ success: true, message: "Blog Added Successfully!" });
    }
  );
};

// ================== DELETE BLOG ==================
exports.deleteBlog = (req, res) => {
  const { primary_id } = req.body;

  if (!primary_id)
    return res.json({ success: false, message: "ID Required" });

  const sql = "DELETE FROM blogs WHERE primary_id = ?";

  db.query(sql, [primary_id], (err) => {
    if (err) {
      console.error("DELETE BLOG ERROR:", err);
      return res.status(500).json({ success: false, message: "Delete Failed" });
    }
    res.json({ success: true, message: "Blog Deleted Successfully" });
  });
};

// ================== GET BLOGS BY CATEGORY ==================
exports.getBlogByCategory = (req, res) => {
  let { category } = req.body;

  if (!category) {
    return res.json({ success: false, message: "Category slug required" });
  }

  const sql = `
    SELECT 
      b.*, 
      GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names
    FROM blogs b
    LEFT JOIN blog_categories c 
      ON JSON_CONTAINS(b.category, JSON_QUOTE(c.slug))
    WHERE JSON_CONTAINS(b.category, JSON_QUOTE(?))
    GROUP BY b.primary_id
    ORDER BY b.primary_id DESC
  `;

  db.query(sql, [category], (err, result) => {
    if (err) {
      console.error("CATEGORY FILTER ERROR:", err);
      return res.status(500).json({ success: false, message: "Database Error" });
    }

    const finalData = result.map((item) => ({
      ...item,
      category: item.category ? JSON.parse(item.category) : [],
      category_names: item.category_names || "",
      coverImgFull: item.coverImg || null,
      blogImgFull: item.blogImg || null,
    }));

    return res.json({
      success: true,
      data: finalData,
    });
  });
};

// ================== BLOG FULL DETAILS ==================
exports.blogDetails = (req, res) => {
  const { slug } = req.body;

  if (!slug) {
    return res.json({ success: false, message: "Slug required" });
  }

  const sql = `
    SELECT 
      b.*, 
      GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names
    FROM blogs b
    LEFT JOIN blog_categories c 
      ON JSON_CONTAINS(b.category, JSON_QUOTE(c.slug))
    WHERE b.slug = ?
    GROUP BY b.primary_id
  `;

  db.query(sql, [slug], (err, result) => {
    if (err) {
      console.error("DETAIL ERROR:", err);
      return res.status(500).json({ success: false, message: "Database Error" });
    }

    if (!result.length) {
      return res.json({ success: false, message: "Blog not found" });
    }

    const data = result[0];

    const finalData = {
      ...data,
      category: data.category ? JSON.parse(data.category) : [],
      category_names: data.category_names || "",
      coverImgFull: data.coverImg || null,
      blogImgFull: data.blogImg || null,
    };

    return res.json({
      success: true,
      data: finalData,
    });
  });
};
