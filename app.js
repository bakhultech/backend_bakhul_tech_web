const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const db = require("./config/db");
const app = express();
const upload = multer();
// app.use(upload.none());
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static("assets"));
// MODELS
require("./models/LoginModel");
require("./models/ContactModel");
require("./models/FaqModel");
require("./models/TeamsModel");
require("./models/TestimonialModel");

// ROUTES
const LoginRoute = require("./routes/LoginRoute");
const WebsiteInfoRoute = require("./routes/WebsiteInfoRoute");
const ContactRoute = require("./routes/ContactRoute");
const FaqRoute = require("./routes/FaqRoute");
const TeamsRoute = require("./routes/TeamsRoute");
const TestimonialRoute = require("./routes/TestimonialRoute");

app.use("/api/admin_link", LoginRoute);
app.use("/api/admin_link", WebsiteInfoRoute);
app.use("/api/admin_link", ContactRoute);
app.use("/api/admin_link", FaqRoute);
app.use("/api/admin_link", TeamsRoute);
app.use("/api/admin_link", TestimonialRoute);

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
