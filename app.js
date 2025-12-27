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
    origin(origin, callback) {
      if (!origin) return callback(null, true); // server / postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS_NOT_ALLOWED"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ===================== BODY PARSERS ===================== */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ===================== INIT DB + MODELS ===================== */
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
      if (model.initializeTable) await model.initializeTable();
      if (model.insertDefault) await model.insertDefault();
    }

    console.log("✅ All models initialized");
  } catch (err) {
    console.error("❌ Startup error:", err.message);
  }
})();

/* ===================== ROUTES ===================== */
app.use("/api/admin_link", require("./routes/LoginRoute"));
app.use("/api/admin_link", require("./routes/WebsiteInfoRoute"));
app.use("/api/admin_link", require("./routes/ContactRoute"));
app.use("/api/admin_link", require("./routes/TeamsRoute"));
app.use("/api/admin_link", require("./routes/BlogRoute"));
app.use("/api/admin_link", require("./routes/BlogCategoryRoute"));

/* ===================== HEALTH ===================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ===================== ROOT ===================== */
app.get("/", (req, res) => {
  res.send("🚀 Bakhul Tech Backend Running");
});

/* ===================== 404 ===================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ===================== GLOBAL ERROR ===================== */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res.status(500).json({
    success: false,
    message:
      err.message === "CORS_NOT_ALLOWED"
        ? "CORS blocked"
        : "Internal server error",
  });
});

/* ===================== START ===================== */
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
