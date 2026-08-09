const express = require("express");
const router = express.Router();

const { getLikes, toggleLike } = require("../controllers/likeController");

router.get("/:blogId", getLikes);
router.post("/", toggleLike);

module.exports = router;
