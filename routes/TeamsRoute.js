const express = require("express");
const router = express.Router();
const multer = require("multer");
const TeamsController = require("../controllers/TeamsController");
const { upload } = TeamsController;
const textOnly = multer();
router.post("/get_teams", textOnly.none(), TeamsController.getTeam);

// Image + other fields
router.post(
  "/save_teams",
  upload.single("profile_img"),
  TeamsController.saveTeam
);

router.post("/delete_teams", upload.none(), TeamsController.deleteTeam);

module.exports = router;
