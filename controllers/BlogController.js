// ================= BLOG CONTROLLER ===================
const db = require("../config/db");
const path = require("path");

// ================== GET BLOG(S) ==================
exports.getBlog = (req, res) => {
  const primary_id = req.body?.primary_id || null;

  let sql = "";
  let params = [];

  if (primary_id) {
    sql = "SELECT * FROM blogs WHERE primary_id = ?";
    params = [primary_id];
  } else {
    sql = "SELECT * FROM blogs ORDER BY primary_id DESC";
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database Error",
      });
    }

    const basePath = `${req.protocol}://${req.get("host")}/assets/blogs/`;

    const finalData = result.map((item) => ({
      ...item,
      coverImgFull: item.coverImg ? basePath + item.coverImg : null,
      blogImgFull: item.blogImg ? basePath + item.blogImg : null,
    }));

    return res.json({
      success: true,
      assetPathName: basePath,
      data: primary_id ? finalData[0] : finalData,
    });
  });
};

// ================== SAVE BLOG (ADD/UPDATE) ==================
exports.saveBlog = (req, res) => {
  const { primary_id, title, subtitle, author, category, shortDesc, fullDesc } =
    req.body;

  const coverImg = req.files?.coverImg ? req.files.coverImg[0].filename : null;
  const blogImg = req.files?.blogImg ? req.files.blogImg[0].filename : null;

  // ------------ UPDATE ------------
  if (primary_id) {
    const getOldSql =
      "SELECT coverImg, blogImg FROM blogs WHERE primary_id = ?";

    db.query(getOldSql, [primary_id], (err, data) => {
      if (err) {
        console.log("FETCH OLD IMG ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Database Error",
        });
      }

      const oldCover = data[0]?.coverImg;
      const oldBlog = data[0]?.blogImg;

      const finalCover = coverImg ? coverImg : oldCover;
      const finalBlog = blogImg ? blogImg : oldBlog;

      const updateSql = `
        UPDATE blogs SET
          title = ?, 
          subtitle = ?, 
          author = ?,
          category = ?, 
          shortDesc = ?, 
          fullDesc = ?,
          coverImg = ?, 
          blogImg = ?
        WHERE primary_id = ?
      `;

      db.query(
        updateSql,
        [
          title,
          subtitle,
          author,
          category,
          shortDesc,
          fullDesc,
          finalCover,
          finalBlog,
          primary_id,
        ],
        (err) => {
          if (err) {
            console.error("UPDATE BLOG ERROR:", err);
            return res.status(500).json({
              success: false,
              message: "Update Failed",
            });
          }

          return res.json({
            success: true,
            message: "Blog Updated Successfully",
          });
        }
      );
    });

    return;
  }

  // ------------ ADD NEW ------------
  const insertSql = `
    INSERT INTO blogs 
    (title, subtitle, author, category, shortDesc, fullDesc, coverImg, blogImg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertSql,
    [title, subtitle, author, category, shortDesc, fullDesc, coverImg, blogImg],
    (err) => {
      if (err) {
        console.error("INSERT BLOG ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Insert Failed",
        });
      }

      return res.json({
        success: true,
        message: "Blog Added Successfully",
      });
    }
  );
};

// ================== DELETE BLOG ==================
exports.deleteBlog = (req, res) => {
  const { primary_id } = req.body;

  if (!primary_id) {
    return res.json({
      success: false,
      message: "ID Required",
    });
  }

  const sql = "DELETE FROM blogs WHERE primary_id = ?";

  db.query(sql, [primary_id], (err) => {
    if (err) {
      console.error("DELETE BLOG ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Delete Failed",
      });
    }

    return res.json({
      success: true,
      message: "Blog Deleted Successfully",
    });
  });
};
