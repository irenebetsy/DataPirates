const express = require("express");
const router = express.Router();

const {
    getAllProjectComments,
    getCommentsByProject,
    createProjectComment,
    deleteProjectComment,
    adminDeleteProjectComment
} = require("../controllers/projectCommentController");

router.get("/", getAllProjectComments);
router.get("/:projectId", getCommentsByProject);
router.post("/", createProjectComment);
router.delete("/admin/:id", adminDeleteProjectComment);
router.delete("/:id", deleteProjectComment);

module.exports = router;
