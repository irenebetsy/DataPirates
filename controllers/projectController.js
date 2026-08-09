const { sql } = require("../config/db");

// GET ALL PROJECTS
const getProjects = async (req, res) => {

    try {

        const result = await sql.query(`
            SELECT * FROM "Projects"
            ORDER BY "CreatedAt" DESC
        `);

        res.json(result.recordset);

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

// GET PROJECT BY ID
const getProjectById = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await sql.query`
            SELECT *
            FROM "Projects"
            WHERE "ProjectID" = ${id}
        `;

        if (result.recordset.length === 0) {

            return res.status(404).json({
                message: "Project not found"
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

// CREATE PROJECT
const createProject = async (req, res) => {

    try {
        console.log(req.body);
        const {
            title,
            description,
            features,
            techStack,
            category,
            status,
            duration,
            githubURL,
            demoURL,
            imageURL
        } = req.body;

        await sql.query`

        INSERT INTO "Projects"
        (
            "Title",
            "Description",
            "TechStack",
            "Category",
            "Status",
            "Duration",
            "Features",
            "GithubURL",
            "DemoURL",
            "ImageURL"
        )

        VALUES
        (
            ${title},
            ${description},
            ${techStack},
            ${category},
            ${status},
            ${duration},
            ${features},
            ${githubURL},
            ${demoURL},
            ${imageURL}
        )

        `;

        res.json({
            message: "Project created successfully"
        });

    }
    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};
// UPDATE PROJECT
const updateProject = async (req, res) => {

    try {

        const { id } = req.params;

        const {

            title,
            description,
            features,
            techStack,
            category,
            status,
            duration,
            githubURL,
            demoURL,
            imageURL

        } = req.body;

        await sql.query`

        UPDATE "Projects"

        SET

            "Title" = ${title},

            "Description" = ${description},

            "Features" = ${features},

            "TechStack" = ${techStack},

            "Category" = ${category},

            "Status" = ${status},

            "Duration" = ${duration},

            "GithubURL" = ${githubURL},

            "DemoURL" = ${demoURL},

            "ImageURL" = ${imageURL}

        WHERE "ProjectID" = ${id}

        `;
        res.json({
            message: "Project updated successfully"
        });

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

// DELETE PROJECT
const deleteProject = async (req, res) => {

    try {

        const { id } = req.params;

        await sql.query`
            DELETE FROM "Projects"
            WHERE "ProjectID" = ${id}
        `;

        res.json({
            message: "Project deleted successfully"
        });

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

module.exports = {

    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject

};
