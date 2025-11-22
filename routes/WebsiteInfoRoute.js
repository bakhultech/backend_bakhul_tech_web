const express = require("express");
const router = express.Router();
const WebsiteInfo = require("../controllers/WebsiteInfoController");
const multer = require("multer");
const upload = multer();

router.get("/get_website_info", WebsiteInfo.getWebsiteInfo);
router.post("/update_webinfo", upload.none(), WebsiteInfo.updateWebsiteInfo);

module.exports = router;
