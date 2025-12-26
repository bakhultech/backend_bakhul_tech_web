// controllers/ContactController.js
const { getDB } = require("../config/db");

// ================= GET ALL CONTACTS =================
exports.getAllContacts = async (req, res) => {
  try {
    const db = await getDB();

    const [rows] = await db.query(
      "SELECT * FROM contact_info ORDER BY created_at DESC"
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("DB Error:", error.message);
    return res.status(500).json({
      success: false,
      type: "DB_ERROR",
      message: "Failed to fetch contacts",
    });
  }
};

// ================= ADD NEW CONTACT =================
exports.addContact = async (req, res) => {
  try {
    const db = await getDB();

    const { name, email, number, query, country, city, company, subject } =
      req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        type: "VALIDATION_ERROR",
        message: "Name and Email are required",
      });
    }

    const sql = `
      INSERT INTO contact_info 
      (name, email, number, query, country, city, company, subject)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      name || "",
      email || "",
      number || "",
      query || "",
      country || "",
      city || "",
      company || "",
      subject || "",
    ]);

    return res.json({
      success: true,
      message: "Contact submitted successfully",
    });
  } catch (error) {
    console.error("DB Error:", error.message);
    return res.status(500).json({
      success: false,
      type: "DB_ERROR",
      message: "Failed to submit contact",
    });
  }
};
