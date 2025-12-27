const express = require("express");
const router = express.Router();
const cat = require("../controllers/BlogCategoryController");
const multer = require("multer");

/**
 * ✅ SAFE MULTER CONFIG
 * - sirf text fields
 * - body undefined issue avoid hota hai
 * - existing FormData APIs safe rehti hain
 */
const textOnly = multer({
  limits: {
    fieldSize: 5 * 1024 * 1024, // 5MB (safe)
  },
});

/* ================= BLOG CATEGORY ROUTES ================= */

// GET (no body needed but FormData safe)
router.post("/get_blog_category", textOnly.none(), cat.getBlogCategories);

// ADD / UPDATE CATEGORY
router.post("/add_blog_category", textOnly.none(), cat.addBlogCategory);

// DELETE CATEGORY
router.post("/delete_blog_category", textOnly.none(), cat.deleteBlogCategory);

module.exports = router;
