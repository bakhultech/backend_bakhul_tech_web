const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/ContactController");
const multer = require("multer");
const upload = multer();

router.post("/get_contacts", ContactController.getAllContacts);
router.post("/add_contact", upload.none(), ContactController.addContact);

module.exports = router;
