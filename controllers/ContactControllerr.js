const db = require("../config/db");
//GET ALL CONTACTS
exports.getAllContacts = (req, res) => {
  const sql = "SELECT * FROM contact_info ORDER BY created_at DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    res.json({ success: true, data: result });
  });
};

//ADD NEW CONTACT
exports.addContact = (req, res) => {
  const { name, email, number, query, country, city, company, subject } =
    req.body;

  const sql = `
    INSERT INTO contact_info 
    (name, email, number, query, country, city, company, subject)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, email, number, query, country, city, company, subject],
    (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      res.json({ success: true, message: "Contact submitted successfully" });
    }
  );
};
