const { sql } = require("../config/db");

// GET LIKE COUNT + WHETHER A GIVEN USER HAS LIKED
const getProjectLikes = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.query;

        const countResult = await sql.query`
            SELECT COUNT(*)::int AS total FROM "ProjectLikes" WHERE "ProjectID" = ${projectId}
        `;

        let liked = false;

        if (userId) {
            const userResult = await sql.query`
                SELECT "LikeID" FROM "ProjectLikes"
                WHERE "ProjectID" = ${projectId} AND "UserID" = ${userId}
            `;

            liked = userResult.recordset.length > 0;
        }

        res.json({
            total: countResult.recordset[0].total,
            liked
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// TOGGLE LIKE (like if not liked yet, unlike if already liked)
const toggleProjectLike = async (req, res) => {
    try {
        const { projectId, userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "You must be logged in to like this project"
            });
        }

        const existing = await sql.query`
            SELECT "LikeID" FROM "ProjectLikes"
            WHERE "ProjectID" = ${projectId} AND "UserID" = ${userId}
        `;

        let liked;

        if (existing.recordset.length > 0) {
            await sql.query`
                DELETE FROM "ProjectLikes"
                WHERE "ProjectID" = ${projectId} AND "UserID" = ${userId}
            `;
            liked = false;
        } else {
            await sql.query`
                INSERT INTO "ProjectLikes" ("ProjectID", "UserID")
                VALUES (${projectId}, ${userId})
            `;
            liked = true;
        }

        const countResult = await sql.query`
            SELECT COUNT(*)::int AS total FROM "ProjectLikes" WHERE "ProjectID" = ${projectId}
        `;

        res.json({
            message: liked ? "Liked" : "Like removed",
            liked,
            total: countResult.recordset[0].total
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getProjectLikes,
    toggleProjectLike
};
