// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getDB } = require("./config/db");

const app = express();

/* ===================== CORS ===================== */
const allowedOrigins = [
  "http://localhost:3000",
  "https://superadminbakhultech.netlify.app",
  "https://bakhultech.com",
  "https://adminpanelbakhultech.vercel.app",
  "https://bakhultechadmin.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server / Postman / Render internal calls
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ===================== BODY PARSERS ===================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ===================== INIT DB + MODELS ===================== */
(async () => {
  try {
    const db = await getDB();
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
      if (typeof model.initializeTable === "function") {
        await model.initializeTable();
      }
      if (typeof model.insertDefault === "function") {
        await model.insertDefault();
      }
    }

    console.log("✅ All models initialized");
  } catch (error) {
    console.error("❌ Startup error:", error);
    // ❗ Render pe process.exit mat karo (container restart loop)
  }
})();

/* ===================== ROUTES ===================== */
app.use("/api/admin_link", require("./routes/LoginRoute"));
app.use("/api/admin_link", require("./routes/WebsiteInfoRoute"));
app.use("/api/admin_link", require("./routes/ContactRoute"));
app.use("/api/admin_link", require("./routes/TeamsRoute"));
app.use("/api/admin_link", require("./routes/BlogRoute"));
app.use("/api/admin_link", require("./routes/BlogCategoryRoute"));

/* ===================== HEALTH CHECK (NO DB HIT) ===================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "bakhul-tech-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ===================== DB HEALTH (MANUAL CHECK ONLY) ===================== */
app.get("/db-health", async (req, res) => {
  try {
    const db = await getDB();
    await db.query("SELECT 1");
    res.status(200).send("✅ Database connected");
  } catch (err) {
    res.status(500).send("❌ Database not reachable");
  }
});

/* ===================== ROOT ===================== */
app.get("/", (req, res) => {
  res.status(200).send("🚀 Bakhul Tech Backend is running");
});

/* ===================== 404 HANDLER ===================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ===================== GLOBAL ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
