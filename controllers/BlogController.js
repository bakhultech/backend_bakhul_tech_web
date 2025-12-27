  // ================= BLOG CONTROLLER ===================
  const { getDB } = require("../config/db");

  // Utility: slugify
  function slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // ================== GET ALL BLOGS OR SINGLE BLOG ==================
  exports.getBlog = async (req, res) => {
    try {
      const db = await getDB();
      const primary_id = req.body?.primary_id || null;

      let sql = `
        SELECT 
          b.*,
          GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names
        FROM blogs b
        LEFT JOIN blog_categories c 
          ON JSON_CONTAINS(b.category, JSON_QUOTE(c.slug))
      `;

      const params = [];

      if (primary_id) {
        sql += ` WHERE b.primary_id = ?`;
        params.push(primary_id);
      }

      sql += ` GROUP BY b.primary_id ORDER BY b.primary_id DESC`;

      const [result] = await db.query(sql, params);

      const finalData = result.map((item) => ({
        ...item,
        category: item.category ? JSON.parse(item.category) : [],
        category_names: item.category_names || "",
        coverImgFull: item.coverImg || null,
        blogImgFull: item.blogImg || null,
        created_at: item.created_at || null,
      }));

      return res.json({
        success: true,
        data: primary_id ? finalData[0] : finalData,
      });
    } catch (err) {
      console.error("GET BLOG ERROR:", err);
      return res.status(500).json({ success: false, message: "Database Error" });
    }
  };

  // ================== SAVE BLOG (ADD / UPDATE) ==================
  exports.saveBlog = async (req, res) => {
    try {
      const db = await getDB();
  
      let {
        primary_id,
        title,
        subtitle,
        author,
        category,
        shortDesc,
        fullDesc
      } = req.body;
  
      // 🔒 REQUIRED
      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }
  
      subtitle = subtitle || "";
      author = author || "Admin";
      shortDesc = shortDesc || "";
      fullDesc = fullDesc || "";
  
      const slug = slugify(title);
  
      // ✅ CATEGORY SAFE PARSE
      let categorySlugs = [];
      if (category) {
        let catNames = [];
  
        try {
          catNames =
            typeof category === "string" ? JSON.parse(category) : category;
        } catch {
          return res.status(400).json({
            success: false,
            message: "Invalid category format",
          });
        }
  
        if (Array.isArray(catNames) && catNames.length) {
          const placeholders = catNames.map(() => "?").join(",");
          const [slugResult] = await db.query(
            `SELECT slug FROM blog_categories WHERE name IN (${placeholders})`,
            catNames
          );
          categorySlugs = slugResult.map((r) => r.slug);
        }
      }
  
      const finalCategoryJson = JSON.stringify(categorySlugs);
      const coverImg = req.body.coverImg || null;
      const blogImg = req.body.blogImg || null;
  
      // 🔁 UPDATE
      if (primary_id) {
        const [oldData] = await db.query(
          "SELECT coverImg, blogImg FROM blogs WHERE primary_id = ?",
          [primary_id]
        );
  
        if (!oldData.length) {
          return res.json({ success: false, message: "Blog not found" });
        }
  
        await db.query(
          `UPDATE blogs SET
            title=?, subtitle=?, author=?, category=?,
            shortDesc=?, fullDesc=?, coverImg=?, blogImg=?, slug=?
           WHERE primary_id=?`,
          [
            title,
            subtitle,
            author,
            finalCategoryJson,
            shortDesc,
            fullDesc,
            coverImg || oldData[0].coverImg,
            blogImg || oldData[0].blogImg,
            slug,
            primary_id,
          ]
        );
  
        return res.json({ success: true, message: "Blog Updated Successfully!" });
      }
  
      // ➕ INSERT
      await db.query(
        `INSERT INTO blogs
        (title, subtitle, author, category, shortDesc, fullDesc, coverImg, blogImg, slug)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        ]
      );
  
      return res.json({ success: true, message: "Blog Added Successfully!" });
    } catch (err) {
      console.error("SAVE BLOG ERROR 🔥:", err);
      return res.status(500).json({
        success: false,
        message: "Save Blog Failed",
      });
    }
  };
  

  // ================== DELETE BLOG ==================
  exports.deleteBlog = async (req, res) => {
    try {
      const db = await getDB();
      const { primary_id } = req.body;

      if (!primary_id) {
        return res.json({ success: false, message: "ID Required" });
      }

      await db.query("DELETE FROM blogs WHERE primary_id = ?", [primary_id]);

      return res.json({
        success: true,
        message: "Blog Deleted Successfully",
      });
    } catch (err) {
      console.error("DELETE BLOG ERROR:", err);
      return res
        .status(500)
        .json({ success: false, message: "Delete Failed" });
    }
  };

  // ================== GET BLOGS BY CATEGORY ==================
  exports.getBlogByCategory = async (req, res) => {
    try {
      const db = await getDB();
      const { category } = req.body;

      if (!category) {
        return res.json({
          success: false,
          message: "Category slug is required",
        });
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

      const [result] = await db.query(sql, [category]);

      const finalData = result.map((item) => ({
        primary_id: item.primary_id,
        title: item.title,
        subtitle: item.subtitle || "",
        shortDesc: item.shortDesc || "",
        author: item.author || "Admin",
        slug: item.slug,
        category: item.category ? JSON.parse(item.category) : [],
        category_names: item.category_names || "",
        coverImgFull: item.coverImg || null,
        blogImgFull: item.blogImg || null,
        created_at: item.created_at || null,
      }));

      return res.json({
        success: true,
        count: finalData.length,
        data: finalData,
      });
    } catch (err) {
      console.error("GET BLOG BY CATEGORY ERROR:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database Error" });
    }
  };

  // ================== BLOG DETAILS BY SLUG ==================
  exports.blogDetails = async (req, res) => {
    try {
      const db = await getDB();
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

      const [result] = await db.query(sql, [slug]);

      if (!result.length) {
        return res.json({ success: false, message: "Blog not found" });
      }

      const data = result[0];

      return res.json({
        success: true,
        data: {
          ...data,
          category: data.category ? JSON.parse(data.category) : [],
          category_names: data.category_names || "",
          coverImgFull: data.coverImg || null,
          blogImgFull: data.blogImg || null,
          created_at: data.created_at || null,
        },
      });
    } catch (err) {
      console.error("BLOG DETAILS ERROR:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database Error" });
    }
  };
