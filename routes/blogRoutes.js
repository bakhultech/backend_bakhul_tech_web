const express = require("express");
const router = express.Router();
const blog = require("../controllers/BlogController");
const multer = require("multer");

// ======== BLOG IMAGE UPLOAD CONFIG =========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/blogs"); // correct folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const blogUpload = multer({ storage });
const textOnly = multer();

// ========== ROUTES ==========

router.post(
  "/save_blog",
  blogUpload.fields([
    { name: "coverImg", maxCount: 1 },
    { name: "blogImg", maxCount: 1 },
  ]),
  blog.saveBlog
);

router.post("/get_blog", textOnly.none(), blog.getBlog);
router.post("/delete_blog", textOnly.none(), blog.deleteBlog);

module.exports = router;
