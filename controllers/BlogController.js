// ================= BLOG CONTROLLER (FINAL SEO VERSION WITH SLUG + blogImgFull) ===================
const db = require("../config/db");

// Utility: slugify
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
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

  if (primary_id) {
    sql += ` WHERE b.primary_id = ${db.escape(primary_id)}`;
  }

  sql += ` GROUP BY b.primary_id ORDER BY b.primary_id DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database Error" });
    }

    const basePath = `${req.protocol}://${req.get("host")}/assets/blogs/`;

    const finalData = result.map((item) => ({
      ...item,
      category: item.category ? JSON.parse(item.category) : [],
      category_names: item.category_names || "",
      coverImgFull: item.coverImg ? basePath + item.coverImg : null,
      blogImgFull: item.blogImg ? basePath + item.blogImg : null,
      created_at: item.created_at || null,
    }));

    return res.json({
      success: true,
      assetPathName: basePath,
      data: primary_id ? finalData[0] : finalData,
    });
  });
};

// ================== SAVE BLOG (ADD / UPDATE) ==================
exports.saveBlog = async (req, res) => {
  let { primary_id, title, subtitle, author, category, shortDesc, fullDesc } =
    req.body;

  const slug = slugify(title); // auto-generate slug

  let categorySlugs = [];

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
      console.log("Category parse error:", e);
      categorySlugs = [];
    }
  }

  const finalCategoryJson = JSON.stringify(categorySlugs);
  const coverImg = req.files?.coverImg ? req.files.coverImg[0].filename : null;
  const blogImg = req.files?.blogImg ? req.files.blogImg[0].filename : null;

  // UPDATE BLOG
  if (primary_id) {
    const getOldSql =
      "SELECT coverImg, blogImg FROM blogs WHERE primary_id = ?";
    db.query(getOldSql, [primary_id], (err, data) => {
      if (err || !data.length) {
        return res
          .status(500)
          .json({ success: false, message: "Blog not found" });
      }

      const finalCover = coverImg || data[0].coverImg;
      const finalBlog = blogImg || data[0].blogImg;

      const updateSql = `
        UPDATE blogs SET
          title = ?, subtitle = ?, author = ?, category = ?, 
          shortDesc = ?, fullDesc = ?, coverImg = ?, blogImg = ?, slug = ?
        WHERE primary_id = ?
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

  // ADD NEW BLOG
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
      coverImg,
      blogImg,
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

  if (!primary_id) {
    return res.json({ success: false, message: "ID Required" });
  }

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
    return res.json({ success: false, message: "Category slug is required" });
  }

  const sql = `
    SELECT 
      b.primary_id,
      b.title,
      b.subtitle,
      b.shortDesc,
      b.author,
      b.category,
      b.coverImg,
      b.blogImg,
      b.slug,
      b.created_at,
      GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names
    FROM blogs b
    LEFT JOIN blog_categories c 
      ON JSON_CONTAINS(b.category, JSON_QUOTE(c.slug))
    WHERE JSON_CONTAINS(b.category, JSON_QUOTE(?))
    GROUP BY b.primary_id
    ORDER BY b.created_at DESC, b.primary_id DESC
  `;

  db.query(sql, [category], (err, result) => {
    if (err) {
      console.error("CATEGORY FILTER ERROR:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database Error" });
    }

    const basePath = `${req.protocol}://${req.get("host")}/assets/blogs/`;

    const finalData = result.map((item) => ({
      primary_id: item.primary_id,
      title: item.title,
      subtitle: item.subtitle || "",
      shortDesc: item.shortDesc || "",
      author: item.author || "Admin",
      slug: item.slug,
      category: item.category ? JSON.parse(item.category) : [],
      category_names: item.category_names || "",
      coverImgFull: item.coverImg ? basePath + item.coverImg : null,
      blogImgFull: item.blogImg ? basePath + item.blogImg : null,
      created_at: item.created_at || null,
    }));

    return res.json({
      success: true,
      count: finalData.length,
      data: finalData,
    });
  });
};

// ================== BLOG FULL DETAILS (FETCH BY SLUG) ==================
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
      return res.json({ success: false, message: "Database Error" });
    }

    if (!result.length) {
      return res.json({ success: false, message: "Blog not found" });
    }

    const basePath = `${req.protocol}://${req.get("host")}/assets/blogs/`;
    const data = result[0];

    const finalData = {
      ...data,
      category: data.category ? JSON.parse(data.category) : [],
      category_names: data.category_names || "",
      coverImgFull: data.coverImg ? basePath + data.coverImg : null,
      blogImgFull: data.blogImg ? basePath + data.blogImg : null,
      created_at: data.created_at || null,
    };

    return res.json({
      success: true,
      data: finalData,
    });
  });
};
