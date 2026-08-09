const { sql } = require("../config/db");

// GET ALL BLOGS
const getBlogs = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT * FROM "Blogs" ORDER BY "CreatedAt" DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET BLOG BY ID
const getBlogById = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await sql.query`
            SELECT * FROM "Blogs"
            WHERE "BlogID" = ${id}
        `;

        if (result.recordset.length === 0) {

            return res.status(404).json({
                message: "Blog not found"
            });

        }

        res.json(result.recordset[0]);

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

// CREATE BLOG (REAL INSERT)
const createBlog = async (req, res) => {
    try {
        const { title, description, content, imageURL } = req.body;

        await sql.query`
            INSERT INTO "Blogs" ("Title", "Description", "Content", "ImageURL", "CreatedAt")
            VALUES (${title}, ${description}, ${content}, ${imageURL}, NOW())
        `;

        res.json({
            message: "Blog created successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// DELETE BLOG

const deleteBlog = async (req, res) => {

    try {

        const { id } = req.params;

        await sql.query`
            DELETE FROM "Blogs"
            WHERE "BlogID" = ${id}
        `;

        res.json({
            message: "Blog deleted successfully"
        });

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

// UPDATE BLOG

const updateBlog = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            description,
            content,
            imageURL
        } = req.body;

        console.log("Updating Blog:", id);
        console.log("ID:", id);
        console.log("Title:", title);
        console.log("Description:", description);
        console.log("Content:", content);
        console.log("ImageURL:", imageURL);

        const result = await sql.query`

            UPDATE "Blogs"

            SET
                "Title" = ${title},
                "Description" = ${description},
                "Content" = ${content},
                "ImageURL" = ${imageURL}

            WHERE "BlogID" = ${id}

        `;

        console.log("Rows affected:", result.rowsAffected);

        res.json({
            message: "Blog updated successfully"
        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports = {

    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog

};
