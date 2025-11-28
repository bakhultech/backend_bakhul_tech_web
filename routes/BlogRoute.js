const express = require("express");
const router = express.Router();
const blog = require("../controllers/BlogController");
const multer = require("multer");

// ======== BLOG IMAGE UPLOAD CONFIG =========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/blogs");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const blogUpload = multer({ storage });
const textOnly = multer();

// ========== ROUTES ==========

// ADD / UPDATE BLOG
router.post(
  "/save_blog",
  blogUpload.fields([
    { name: "coverImg", maxCount: 1 },
    { name: "blogImg", maxCount: 1 },
  ]),
  blog.saveBlog
);

// GET BLOG (single or all)
router.post("/get_blog", textOnly.none(), blog.getBlog);

// DELETE BLOG
router.post("/delete_blog", textOnly.none(), blog.deleteBlog);

// GET BLOG BY CATEGORY
router.post("/get_blog_by_category", textOnly.none(), blog.getBlogByCategory);
router.post("/blog_details", textOnly.none(), blog.blogDetails);

module.exports = router;
