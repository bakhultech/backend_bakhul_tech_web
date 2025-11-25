const express = require("express");
const router = express.Router();
const FaqController = require("../controllers/FaqController");
const multer = require("multer");
const upload = multer();
const textOnly = multer();
router.post("/get_faq", textOnly.none(), FaqController.getFAQ);
router.post("/save_faq", upload.none(), FaqController.saveFAQ);
router.post("/delete_faq", upload.none(), FaqController.deleteFAQ);

module.exports = router;
