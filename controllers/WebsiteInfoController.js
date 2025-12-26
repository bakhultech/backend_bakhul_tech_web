// controllers/WebsiteInfoController.js
const { getDB } = require("../config/db");

// ================= GET WEBSITE INFO =================
exports.getWebsiteInfo = async (req, res) => {
  try {
    const db = await getDB();

    const [rows] = await db.query(
      "SELECT * FROM website_info WHERE primary_id = 1"
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "No data found",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ getWebsiteInfo DB Error:", error.message);
    return res.status(500).json({
      success: false,
      type: "DB_ERROR",
      message: "Database error",
    });
  }
};

// ================= UPDATE WEBSITE INFO =================
exports.updateWebsiteInfo = async (req, res) => {
  try {
    const db = await getDB();

    const {
      email = "",
      phone = "",
      education_email = "",
      address = "",
      footerText = "",
      facebook = "",
      instagram = "",
      youtube = "",
      linkedin = "",
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

    const [result] = await db.query(sql, [
      email,
      phone,
      education_email,
      address,
      footerText,
      facebook,
      instagram,
      youtube,
      linkedin,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    return res.json({
      success: true,
      message: "Website info updated successfully!",
    });
  } catch (error) {
    console.error("❌ updateWebsiteInfo DB Error:", error.message);
    return res.status(500).json({
      success: false,
      type: "DB_ERROR",
      message: "Database error",
    });
  }
};
