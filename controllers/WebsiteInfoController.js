const db = require("../config/db");

// ==========================
//    GET WEBSITE INFO
// ==========================
exports.getWebsiteInfo = (req, res) => {
  const sql = "SELECT * FROM website_info WHERE primary_id = 1";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    return res.json({ success: true, data: result[0] });
  });
};

// ==========================
//    UPDATE WEBSITE INFO
// ==========================
exports.updateWebsiteInfo = (req, res) => {
  const { email, phone, address, footerText, facebook, instagram, youtube } =
    req.body;

  const sql = `
    UPDATE website_info 
    SET email=?, phone=?, address=?, footerText=?, facebook=?, instagram=?, youtube=? 
    WHERE primary_id = 1
  `;

  db.query(
    sql,
    [email, phone, address, footerText, facebook, instagram, youtube],
    (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      res.json({
        success: true,
        message: "Website info updated successfully",
      });
    }
  );
};
