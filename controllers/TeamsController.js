const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// ================= IMAGE UPLOAD ==================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/teams");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage });

// ===================== GET TEAM =====================
exports.getTeam = (req, res) => {
  const primary_id = req.body?.primary_id || null;

  let sql = "";
  let params = [];

  if (primary_id) {
    sql = "SELECT * FROM teams WHERE primary_id = ?";
    params = [primary_id];
  } else {
    sql = "SELECT * FROM teams WHERE status = 1 ORDER BY primary_id ASC";
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log("GET TEAM ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    // FULL PATH BUILD
    const basePath = `${req.protocol}://${req.get("host")}/assets/teams/`;

    const finalData = result.map((item) => ({
      ...item,
      profileImgFull: item.profile_img ? basePath + item.profile_img : null,
    }));

    return res.json({
      success: true,
      assetPathName: basePath,
      data: primary_id ? finalData[0] : finalData,
    });
  });
};
// ===================== ADD / UPDATE TEAM =====================
exports.saveTeam = (req, res) => {
  const {
    primary_id,
    name,
    position,
    email,
    phone,
    status, // active/deactive (1 / 0)
  } = req.body;

  const profile_img = req.file ? req.file.filename : null;

  // Removed mandatory field check

  // ------------ UPDATE ------------
  if (primary_id) {
    const getOldSql = "SELECT profile_img FROM teams WHERE primary_id = ?";

    db.query(getOldSql, [primary_id], (err, data) => {
      if (err) {
        console.log("FETCH OLD IMG ERROR:", err);
        return res.status(500).json({ success: false });
      }

      const oldImage = data[0]?.profile_img;
      const finalImg = profile_img ? profile_img : oldImage;

      const updateSql = `
        UPDATE teams
        SET name=?, position=?, email=?, phone=?, profile_img=?, status=?
        WHERE primary_id=?
      `;

      db.query(
        updateSql,
        [name, position, email, phone, finalImg, status ?? 1, primary_id],
        (err) => {
          if (err) {
            console.log("UPDATE ERROR:", err);
            return res.status(500).json({ success: false });
          }

          return res.json({
            success: true,
            message: "Team updated successfully",
          });
        }
      );
    });

    return;
  }

  // ------------ ADD NEW ------------
  const sql = `
      INSERT INTO teams (name, position, email, phone, profile_img, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [name, position, email, phone, profile_img, status ?? 1],
    (err) => {
      if (err) {
        console.log("INSERT ERROR:", err);
        return res.status(500).json({ success: false });
      }

      return res.json({ success: true, message: "Team added successfully" });
    }
  );
};

// ===================== SOFT DELETE =====================
exports.deleteTeam = (req, res) => {
  const { primary_id } = req.body;

  if (!primary_id) {
    return res.json({ success: false, message: "ID required" });
  }

  const sql = "UPDATE teams SET status = 0 WHERE primary_id = ?";

  db.query(sql, [primary_id], (err) => {
    if (err) {
      console.log("DELETE ERROR:", err);
      return res.status(500).json({ success: false });
    }

    return res.json({
      success: true,
      message: "Team removed (soft deleted)",
    });
  });
};
