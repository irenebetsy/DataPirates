const { sql } = require("../config/db");

// GET ALL PROJECT COMMENTS (admin moderation view)
const getAllProjectComments = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT c.*, p."Title" AS "ProjectTitle"
            FROM "ProjectComments" c
            LEFT JOIN "Projects" p ON c."ProjectID" = p."ProjectID"
            ORDER BY c."CreatedAt" DESC
        `;

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET COMMENTS FOR A PROJECT
const getCommentsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const result = await sql.query`
            SELECT * FROM "ProjectComments"
            WHERE "ProjectID" = ${projectId}
            ORDER BY "CreatedAt" ASC
        `;

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE PROJECT COMMENT
const createProjectComment = async (req, res) => {
    try {
        const { projectId, userId, userName, content } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "You must be logged in to comment"
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        await sql.query`
            INSERT INTO "ProjectComments" ("ProjectID", "UserID", "UserName", "Content")
            VALUES (${projectId}, ${userId}, ${userName}, ${content})
        `;

        res.json({
            message: "Comment posted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE COMMENT (only by the user who posted it)
const deleteProjectComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const result = await sql.query`
            DELETE FROM "ProjectComments"
            WHERE "CommentID" = ${id} AND "UserID" = ${userId}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(403).json({
                message: "You can only delete your own comments"
            });
        }

        res.json({
            message: "Comment deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE COMMENT AS ADMIN (no ownership check - dashboard moderation)
const adminDeleteProjectComment = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.query`
            DELETE FROM "ProjectComments" WHERE "CommentID" = ${id}
        `;

        res.json({
            message: "Comment deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllProjectComments,
    getCommentsByProject,
    createProjectComment,
    deleteProjectComment,
    adminDeleteProjectComment
};
