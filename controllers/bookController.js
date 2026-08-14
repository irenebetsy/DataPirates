const { sql } = require("../config/db");

// GET ALL BOOKS
const getBooks = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT * FROM "Books" ORDER BY "CreatedAt" DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET BOOK BY ID
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT * FROM "Books"
            WHERE "BookID" = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(result.recordset[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE BOOK
const createBook = async (req, res) => {
    try {
        const { title, author, description, coverURL, status, rating, pinned  } = req.body;

        await sql.query`
            INSERT INTO "Books" ("Title", "Author", "Description", "CoverURL", "Status", "Rating", "Pinned")
            VALUES (${title}, ${author}, ${description}, ${coverURL}, ${status}, ${rating}, ${pinned})
        `;

        res.json({
            message: "Book added successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE BOOK
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, description, coverURL, status, rating, pinned } = req.body;

        await sql.query`
            UPDATE "Books"
            SET
                "Title" = ${title},
                "Author" = ${author},
                "Description" = ${description},
                "CoverURL" = ${coverURL},
                "Status" = ${status},
                "Rating" = ${rating},
                "Pinned" = ${pinned}
            WHERE "BookID" = ${id}
        `;

        res.json({
            message: "Book updated successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE BOOK
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.query`
            DELETE FROM "Books"
            WHERE "BookID" = ${id}
        `;

        res.json({
            message: "Book deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
