const express = require("express");
const router = express.Router();

const {
    getAllComments,
    getCommentsByBlog,
    createComment,
    deleteComment,
    adminDeleteComment
} = require("../controllers/commentController");

router.get("/", getAllComments);
router.get("/:blogId", getCommentsByBlog);
router.post("/", createComment);
router.delete("/admin/:id", adminDeleteComment);
router.delete("/:id", deleteComment);

module.exports = router;
