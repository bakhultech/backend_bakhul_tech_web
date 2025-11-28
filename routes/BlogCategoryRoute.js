const express = require("express");
const router = express.Router();
const cat = require("../controllers/BlogCategoryController");
const multer = require("multer");

const textOnly = multer();

router.post("/get_blog_category", cat.getBlogCategories);
router.post("/add_blog_category", textOnly.none(), cat.addBlogCategory);
router.post("/delete_blog_category", textOnly.none(), cat.deleteBlogCategory);

module.exports = router;
