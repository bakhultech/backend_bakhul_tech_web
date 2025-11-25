const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// ================= IMAGE UPLOAD ==================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/testimonial");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage });

// ===================== GET testimonial =====================
exports.get_testimonial = (req, res) => {
  const primary_id = req.body?.primary_id || null;
  const basePath = `${req.protocol}://${req.get("host")}/assets/testimonial/`;
  if (primary_id) {
    const sql = "SELECT * FROM testimonial WHERE primary_id = ? LIMIT 1";

    db.query(sql, [primary_id], (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      if (result.length === 0) {
        return res.json({
          success: false,
          message: "Testimonial not found",
        });
      }

      const row = result[0];

      return res.json({
        success: true,
        data: {
          ...row,
          testiImgFull: row.testi_img ? basePath + row.testi_img : null,
        },
      });
    });
  }

  // 2️⃣ If NO primary_id → return full list
  else {
    const sql = "SELECT * FROM testimonial ORDER BY primary_id ASC";

    db.query(sql, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      const finalData = result.map((item) => ({
        ...item,
        testiImgFull: item.testi_img ? basePath + item.testi_img : null,
      }));

      return res.json({
        success: true,
        data: finalData,
      });
    });
  }
};

// ===================== ADD / UPDATE testimonial =====================
exports.saveTestimonial = (req, res) => {
  const { primary_id, full_name, position, rating, testi_msg } = req.body;
  const testi_img = req.file ? req.file.filename : null;

  if (primary_id) {
    const getOldSql = "SELECT testi_img FROM testimonial WHERE primary_id = ?";

    db.query(getOldSql, [primary_id], (err, data) => {
      if (err) {
        console.log("FETCH OLD IMG ERROR:", err);
        return res.status(500).json({ success: false });
      }

      const oldImage = data[0]?.testi_img;
      const finalImg = testi_img || oldImage;

      const updateSql = `
          UPDATE testimonial
          SET full_name = ?,
              position = ?,
              rating = ?,
              testi_msg = ?,
              testi_img = ?
          WHERE primary_id = ?
        `;

      db.query(
        updateSql,
        [full_name, position, rating || null, testi_msg, finalImg, primary_id],
        (err) => {
          if (err) {
            console.log("UPDATE ERROR:", err);
            return res.status(500).json({ success: false });
          }

          return res.json({
            success: true,
            message: "Testimonial updated successfully",
          });
        }
      );
    });
  } else {
    // ADD NEW
    const insertSql = `
        INSERT INTO testimonial (full_name, position, rating, testi_msg, testi_img)
        VALUES (?, ?, ?, ?, ?)
      `;

    db.query(
      insertSql,
      [full_name, position, rating || null, testi_msg, testi_img],
      (err) => {
        if (err) {
          console.log("INSERT ERROR:", err);
          return res.status(500).json({ success: false });
        }

        return res.json({
          success: true,
          message: "Testimonial added successfully",
        });
      }
    );
  }
};

// ===================== DELETE testimonial =====================
exports.deleteTestimonial = (req, res) => {
  const { primary_id } = req.body;

  if (!primary_id) {
    return res.json({ success: false, message: "ID required" });
  }

  const sql = "DELETE FROM testimonial WHERE primary_id = ?";
  db.query(sql, [primary_id], (err) => {
    if (err) {
      console.log("DELETE ERROR:", err);
      return res.status(500).json({ success: false });
    }

    return res.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  });
};
