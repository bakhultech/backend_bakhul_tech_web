// app.js

const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const { getDB } = require("./config/db");

const app = express();
const upload = multer();

// ===================== CORS =====================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://superadminbakhultech.netlify.app",
      "https://bakhultech.com",
      "https://adminpanelbakhultech.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== INIT DB + MODELS =====================
(async () => {
  try {
    await getDB();
    console.log("✅ DB pool ready");

    const models = [
      require("./models/WebsiteInfoModel"),
      require("./models/LoginModel"),
      require("./models/ContactModel"),
      require("./models/TeamsModel"),
      require("./models/BlogCategoryModel"),
      require("./models/BlogModel"),
    ];

    for (const model of models) {
      if (model.initializeTable) {
        await model.initializeTable();
      }
      if (model.insertDefault) {
        await model.insertDefault();
      }
    }

    console.log("✅ All models initialized");
  } catch (error) {
    console.error("❌ Startup error:", error.message);
    process.exit(1);
  }
})();

// ===================== ROUTES =====================
const routes = [
  require("./routes/LoginRoute"),
  require("./routes/WebsiteInfoRoute"),
  require("./routes/ContactRoute"),
  require("./routes/TeamsRoute"),
  require("./routes/BlogRoute"),
  require("./routes/BlogCategoryRoute"),
];

routes.forEach((route) => app.use("/api/admin_link", route));

/**
 * ===================== HEALTH CHECK (NO DB HIT) =====================
 * 👉 UptimeRobot isi URL ko hit karega
 * 👉 Zero cost
 * 👉 Zero DB load
 * 👉 Prevents Render sleep
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "bakhul-tech-backend",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/**
 * ===================== DB HEALTH (OPTIONAL) =====================
 * ❗ Isko UptimeRobot me use mat karna
 * Sirf manual check ke liye
 */
app.get("/db-health", async (req, res) => {
  try {
    const db = await getDB();
    await db.query("SELECT 1");
    res.send("✅ Database connected");
  } catch (err) {
    res.status(500).send("❌ Database not reachable");
  }
});

/**
 * ===================== ROOT =====================
 */
app.get("/", (req, res) => {
  res.send("🚀 Bakhul Tech Backend is running");
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
