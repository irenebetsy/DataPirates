const { sql } = require("../config/db");

// GET ALL COMMENTS (admin moderation view)
const getAllComments = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT c.*, b."Title" AS "BlogTitle"
            FROM "Comments" c
            LEFT JOIN "Blogs" b ON c."BlogID" = b."BlogID"
            ORDER BY c."CreatedAt" DESC
        `;

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET COMMENTS FOR A BLOG
const getCommentsByBlog = async (req, res) => {
    try {
        const { blogId } = req.params;

        const result = await sql.query`
            SELECT * FROM "Comments"
            WHERE "BlogID" = ${blogId}
            ORDER BY "CreatedAt" ASC
        `;

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE COMMENT
const createComment = async (req, res) => {
    try {
        const { blogId, userId, userName, content } = req.body;

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
            INSERT INTO "Comments" ("BlogID", "UserID", "UserName", "Content")
            VALUES (${blogId}, ${userId}, ${userName}, ${content})
        `;

        res.json({
            message: "Comment posted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE COMMENT (only by the user who posted it)
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const result = await sql.query`
            DELETE FROM "Comments"
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
const adminDeleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.query`
            DELETE FROM "Comments" WHERE "CommentID" = ${id}
        `;

        res.json({
            message: "Comment deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllComments,
    getCommentsByBlog,
    createComment,
    deleteComment,
    adminDeleteComment
};
