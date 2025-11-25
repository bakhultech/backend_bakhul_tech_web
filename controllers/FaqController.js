// ================= FAQ CONTROLLER ===================

const db = require("../config/db");

// ===================== GET FAQ =====================
exports.getFAQ = (req, res) => {
  const primary_id = req.body?.primary_id || null;

  // 1️⃣ If ID is provided → return single FAQ
  if (primary_id) {
    const sql = "SELECT * FROM faq WHERE primary_id = ? LIMIT 1";

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
          message: "FAQ not found",
        });
      }

      return res.json({
        success: true,
        data: result[0],
      });
    });
  }

  // 2️⃣ No ID → return all FAQ
  else {
    const sql = "SELECT * FROM faq ORDER BY primary_id ASC";

    db.query(sql, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      return res.json({
        success: true,
        data: result,
      });
    });
  }
};

// ===================== SAVE FAQ (ADD/UPDATE) =====================
// ===================== SAVE FAQ (ADD/UPDATE) =====================
exports.saveFAQ = (req, res) => {
  const { primary_id, question, answer } = req.body;

  // UPDATE
  if (primary_id) {
    const updateSql = `
      UPDATE faq
      SET question = ?, answer = ?
      WHERE primary_id = ?
    `;

    db.query(updateSql, [question, answer, primary_id], (err) => {
      if (err) {
        console.error("UPDATE ERROR:", err);
        return res.status(500).json({ success: false });
      }

      return res.json({
        success: true,
        message: "FAQ Updated Successfully",
      });
    });
  }

  // INSERT NEW
  else {
    const insertSql = `
      INSERT INTO faq (question, answer)
      VALUES (?, ?)
    `;

    db.query(insertSql, [question, answer], (err) => {
      if (err) {
        console.error("INSERT ERROR:", err);
        return res.status(500).json({ success: false });
      }

      return res.json({
        success: true,
        message: "FAQ Added Successfully",
      });
    });
  }
};

// ===================== DELETE FAQ =====================
exports.deleteFAQ = (req, res) => {
  const { primary_id } = req.body;

  if (!primary_id) {
    return res.json({
      success: false,
      message: "ID required",
    });
  }

  const sql = "DELETE FROM faq WHERE primary_id = ?";

  db.query(sql, [primary_id], (err) => {
    if (err) {
      console.error("DELETE FAQ ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Delete failed",
      });
    }

    return res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  });
};
