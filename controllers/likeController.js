const { sql } = require("../config/db");

// GET LIKE COUNT + WHETHER A GIVEN USER HAS LIKED
const getLikes = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { userId } = req.query;

        const countResult = await sql.query`
            SELECT COUNT(*)::int AS total FROM "Likes" WHERE "BlogID" = ${blogId}
        `;

        let liked = false;

        if (userId) {
            const userResult = await sql.query`
                SELECT "LikeID" FROM "Likes"
                WHERE "BlogID" = ${blogId} AND "UserID" = ${userId}
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
const toggleLike = async (req, res) => {
    try {
        const { blogId, userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "You must be logged in to like a post"
            });
        }

        const existing = await sql.query`
            SELECT "LikeID" FROM "Likes"
            WHERE "BlogID" = ${blogId} AND "UserID" = ${userId}
        `;

        let liked;

        if (existing.recordset.length > 0) {
            await sql.query`
                DELETE FROM "Likes"
                WHERE "BlogID" = ${blogId} AND "UserID" = ${userId}
            `;
            liked = false;
        } else {
            await sql.query`
                INSERT INTO "Likes" ("BlogID", "UserID")
                VALUES (${blogId}, ${userId})
            `;
            liked = true;
        }

        const countResult = await sql.query`
            SELECT COUNT(*)::int AS total FROM "Likes" WHERE "BlogID" = ${blogId}
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
    getLikes,
    toggleLike
};
