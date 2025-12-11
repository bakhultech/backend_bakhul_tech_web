const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const db = require("./config/db");

// ============================================
//              APP SETUP
// ============================================
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ============================================
//       CHECK DATABASE CONNECTION (POOL)
// ============================================
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ Database Connected Successfully");
    connection.release();
  }
});

// ============================================
//                 MODELS
// ============================================
const models = [
  require("./models/WebsiteInfoModel"),
  require("./models/LoginModel"),
  require("./models/ContactModel"),
  require("./models/FaqModel"),
  require("./models/TeamsModel"),
  require("./models/TestimonialModel"),
  require("./models/BlogCategoryModel"),
  require("./models/BlogModel"),
];

// Initialize all tables
models.forEach((model) => {
  if (model.initializeTable) {
    model.initializeTable();
  }
});

// ============================================
//                 ROUTES
// ============================================
const routes = [
  require("./routes/LoginRoute"),
  require("./routes/WebsiteInfoRoute"),
  require("./routes/ContactRoute"),
  require("./routes/FaqRoute"),
  require("./routes/TeamsRoute"),
  require("./routes/TestimonialRoute"),
  require("./routes/BlogRoute"),
  require("./routes/BlogCategoryRoute"),
];

routes.forEach((route) => app.use("/api/admin_link", route));

// ============================================
//              HEALTH CHECK
// ============================================
app.get("/", (req, res) => {
  res.send("🚀 Bakhul Tech Backend Running Successfully!");
});

// ============================================
//              START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
