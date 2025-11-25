const db = require("../config/db");

const TestimonialModel = {
  initializeTable: () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS testimonial (
        primary_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        rating DECIMAL(2,1) DEFAULT NULL,
        testi_msg TEXT NOT NULL,
        testi_img VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_rating (rating),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(sql, (err) => {
      if (err) {
        console.error("Testimonial table creation error:", err);
      } else {
        console.log("Testimonial table checked/created ✔");
      }
    });
  },
};

TestimonialModel.initializeTable();

module.exports = TestimonialModel;
