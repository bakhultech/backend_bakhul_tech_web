// controllers/LoginController.js
const { getDB } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.LoginController = async (req, res) => {
  try {
    // ================= BODY SAFE READ =================
    const email =
      req.body?.admin_email ||
      req.body?.email ||
      "";

    const password =
      req.body?.admin_password ||
      req.body?.password ||
      "";

    // ================= VALIDATION =================
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        type: "VALIDATION_ERROR",
        message: "Email and Password are required",
      });
    }

    const db = await getDB();

    // ================= FIND USER =================
    const [rows] = await db.query(
      "SELECT * FROM AdminLogin WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        type: "EMAIL_NOT_FOUND",
        message: "This email does not exist",
      });
    }

    const user = rows[0];

    // ================= PASSWORD CHECK =================
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        type: "WRONG_PASSWORD",
        message: "Incorrect password",
      });
    }

    // ================= TOKEN =================
    const token = jwt.sign(
      {
        userId: user.primary_id,
        email: user.email,
        role: user.role || "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ================= SUCCESS =================
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      userId: user.primary_id,
      email: user.email,
      role: user.role || "admin",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    // ================= DB / NETWORK ERROR =================
    if (
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("certificate") ||
      error.message?.includes("connect")
    ) {
      return res.status(503).json({
        success: false,
        type: "DB_DOWN",
        message: "Server temporarily unavailable",
      });
    }

    return res.status(500).json({
      success: false,
      type: "SERVER_ERROR",
      message: "Internal server error",
    });
  }
};
