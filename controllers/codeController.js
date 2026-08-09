const { sql } = require("../config/db");

// GET ALL CODE SNIPPETS
const getCode = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT * FROM "CodeSnippets" ORDER BY "CreatedAt" DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET CODE SNIPPET BY ID
const getCodeById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql.query`
            SELECT * FROM "CodeSnippets"
            WHERE "CodeID" = ${id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Code snippet not found"
            });
        }

        res.json(result.recordset[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE CODE SNIPPET
const createCode = async (req, res) => {
    try {
        const { title, description, language, code, githubURL } = req.body;

        await sql.query`
            INSERT INTO "CodeSnippets" ("Title", "Description", "Language", "Code", "GithubURL")
            VALUES (${title}, ${description}, ${language}, ${code}, ${githubURL})
        `;

        res.json({
            message: "Code snippet created successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE CODE SNIPPET
const updateCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, language, code, githubURL } = req.body;

        await sql.query`
            UPDATE "CodeSnippets"
            SET
                "Title" = ${title},
                "Description" = ${description},
                "Language" = ${language},
                "Code" = ${code},
                "GithubURL" = ${githubURL}
            WHERE "CodeID" = ${id}
        `;

        res.json({
            message: "Code snippet updated successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE CODE SNIPPET
const deleteCode = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.query`
            DELETE FROM "CodeSnippets"
            WHERE "CodeID" = ${id}
        `;

        res.json({
            message: "Code snippet deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCode,
    getCodeById,
    createCode,
    updateCode,
    deleteCode
};
