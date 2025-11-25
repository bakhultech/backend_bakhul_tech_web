const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  upload,
  get_testimonial,
  saveTestimonial,
  deleteTestimonial,
} = require("../controllers/TestimonialController");

const textOnly = multer();

router.post("/get_testimonial", textOnly.none(), get_testimonial);
router.post("/delete_testimonial", textOnly.none(), deleteTestimonial);
router.post("/save_testimonial", upload.single("testi_img"), saveTestimonial);

module.exports = router;
