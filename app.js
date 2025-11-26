const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const db = require("./config/db");

const app = express();
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static("assets"));

// ===================== MODELS =====================
const WebsiteInfoModel = require("./models/WebsiteInfoModel");
const LoginModel = require("./models/LoginModel");
const ContactModel = require("./models/ContactModel");
const FAQModel = require("./models/FaqModel");
const TeamsModel = require("./models/TeamsModel");
const TestimonialModel = require("./models/TestimonialModel");
const BlogModel = require("./models/BlogModel");

// ======== INIT TABLES (IMPORTANT) ========
if (WebsiteInfoModel.initializeTable) WebsiteInfoModel.initializeTable();
if (LoginModel.initializeTable) LoginModel.initializeTable();
if (ContactModel.initializeTable) ContactModel.initializeTable();
if (FAQModel.initializeTable) FAQModel.initializeTable();
if (TeamsModel.initializeTable) TeamsModel.initializeTable();
if (TestimonialModel.initializeTable) TestimonialModel.initializeTable();
if (BlogModel.initializeTable) BlogModel.initializeTable();

// ===================== ROUTES =====================
const LoginRoute = require("./routes/LoginRoute");
const WebsiteInfoRoute = require("./routes/WebsiteInfoRoute");
const ContactRoute = require("./routes/ContactRoute");
const FaqRoute = require("./routes/FaqRoute");
const TeamsRoute = require("./routes/TeamsRoute");
const TestimonialRoute = require("./routes/TestimonialRoute");
const blogRoutes = require("./routes/blogRoutes");

app.use("/api/admin_link", LoginRoute);
app.use("/api/admin_link", WebsiteInfoRoute);
app.use("/api/admin_link", ContactRoute);
app.use("/api/admin_link", FaqRoute);
app.use("/api/admin_link", TeamsRoute);
app.use("/api/admin_link", TestimonialRoute);
app.use("/api/admin_link", blogRoutes);

// =============== START SERVER ===============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
