//BlogRoute
const express = require("express");
const router = express.Router();
const blog = require("../controllers/BlogController");
const multer = require("multer");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");

// Multer memory storage (required for Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });
const textOnly = multer();

// ========== ROUTES ==========

// ADD / UPDATE BLOG
router.post(
  "/save_blog",
  upload.fields([
    { name: "coverImg", maxCount: 1 },
    { name: "blogImg", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Upload to Cloudinary — coverImg
      if (req.files?.coverImg?.[0]) {
        const uploadResult = await uploadToCloudinary(
          req.files.coverImg[0].buffer,
          "blogs"
        );
        req.body.coverImg = uploadResult.secure_url; // Cloudinary URL
      }

      // Upload to Cloudinary — blogImg
      if (req.files?.blogImg?.[0]) {
        const uploadResult2 = await uploadToCloudinary(
          req.files.blogImg[0].buffer,
          "blogs"
        );
        req.body.blogImg = uploadResult2.secure_url;
      }

      blog.saveBlog(req, res);
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }
  }
);

// GET BLOG (single or all)
router.post("/get_blog", textOnly.none(), blog.getBlog);

// DELETE BLOG
router.post("/delete_blog", textOnly.none(), blog.deleteBlog);

// GET BLOG BY CATEGORY
router.post("/get_blog_by_category", textOnly.none(), blog.getBlogByCategory);

// BLOG DETAILS
router.post("/blog_details", textOnly.none(), blog.blogDetails);

module.exports = router;
