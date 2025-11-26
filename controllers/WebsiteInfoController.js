const db = require("../config/db");

// GET WEBSITE INFO
exports.getWebsiteInfo = (req, res) => {
  const sql = "SELECT * FROM website_info WHERE primary_id = 1";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    if (!result.length) {
      return res.status(404).json({ success: false, message: "No data found" });
    }
    res.json({ success: true, data: result[0] });
  });
};

// UPDATE WEBSITE INFO
exports.updateWebsiteInfo = (req, res) => {
  const {
    email,
    phone,
    education_email,
    address,
    footerText,
    facebook,
    instagram,
    youtube,
    linkedin = "", // agar frontend se nahi aaya to empty rahega
  } = req.body;

  const sql = `
    UPDATE website_info SET
      email = ?,
      phone = ?,
      education_email = ?,
      address = ?,
      footerText = ?,
      facebook = ?,
      instagram = ?,
      youtube = ?,
      linkedin = ?
    WHERE primary_id = 1
  `;

  db.query(
    sql,
    [
      email || "",
      phone || "",
      education_email || "",
      address || "",
      footerText || "",
      facebook || "",
      instagram || "",
      youtube || "",
      linkedin,
    ],
    (err, result) => {
      if (err) {
        console.error("Update Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Record not found" });
      }

      res.json({
        success: true,
        message: "Website info updated successfully!",
      });
    }
  );
};
