const express = require("express");
const router = express.Router();

const { getProjectLikes, toggleProjectLike } = require("../controllers/projectLikeController");

router.get("/:projectId", getProjectLikes);
router.post("/", toggleProjectLike);

module.exports = router;
