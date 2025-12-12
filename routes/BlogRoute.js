// routes/BlogRoute.js

const express = require("express");
const router = express.Router();
const blog = require("../controllers/BlogController");
const multer = require("multer");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");

// Multer (memory storage for Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });
const textOnly = multer();

// ===================== ROUTES =====================

// ADD / UPDATE BLOG
router.post(
  "/save_blog",
  upload.fields([
    { name: "coverImg", maxCount: 1 },
    { name: "blogImg", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Upload Cover Image
      if (req.files?.coverImg?.[0]) {
        const uploadResult = await uploadToCloudinary(
          req.files.coverImg[0].buffer,
          "blogs"
        );
        req.body.coverImg = uploadResult.secure_url; // Cloudinary URL
      }

      // Upload Blog Image
      if (req.files?.blogImg?.[0]) {
        const uploadResult2 = await uploadToCloudinary(
          req.files.blogImg[0].buffer,
          "blogs"
        );
        req.body.blogImg = uploadResult2.secure_url; // Cloudinary URL
      }

      // Call main controller
      blog.saveBlog(req, res);
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }
  }
);

// GET BLOG(S)
router.post("/get_blog", textOnly.none(), blog.getBlog);

// DELETE BLOG
router.post("/delete_blog", textOnly.none(), blog.deleteBlog);

// GET BLOG BY CATEGORY
router.post("/get_blog_by_category", textOnly.none(), blog.getBlogByCategory);

// BLOG DETAILS BY SLUG
router.post("/blog_details", textOnly.none(), blog.blogDetails);

module.exports = router;
