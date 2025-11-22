const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");

const app = express();
// Middleware
app.use(cors());
// 🔥 VERY IMPORTANT: Add this for FormData support
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
// MODELS
require("./models/LoginModel");

// ROUTES
const LoginRoute = require("./routes/LoginRoute");
const ContactRoutes = require("./routes/ContactRoutes");
const WebsiteInfoRoute = require("./routes/WebsiteInfoRoute");

app.use("/api/admin_link", LoginRoute);
app.use("/api/admin_link", ContactRoutes);
app.use("/api/admin_link", WebsiteInfoRoute);

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
