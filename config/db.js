const { Pool } = require("pg");

// Fail loudly at startup if required env vars are missing, instead of
// letting every route silently 500 with a confusing error later.
const requiredVars = ["DB_USER", "DB_PASSWORD", "DB_SERVER", "DB_NAME"];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error("=======================================");
    console.error("❌ Missing required .env variables:", missing.join(", "));
    console.error("Copy .env.example to .env and fill in your PostgreSQL details.");
    console.error("=======================================");
    process.exit(1);
}

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
    // Most free Postgres hosts (Render, Neon, Supabase) require SSL.
    // Set DB_SSL=false in .env only for a local Postgres install that
    // doesn't have SSL configured.
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false }
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
});

// Supports two call styles used throughout the controllers:
//   sql.query`SELECT * FROM Table WHERE Id = ${id}`   (tagged template)
//   sql.query(`SELECT * FROM Table`)                   (plain string call)
//
// Converts ${value} placeholders into safe, parameterized $1, $2, ...
// placeholders under the hood (prevents SQL injection, same as before).
async function query(strings, ...values) {

    let text;
    let params;

    const isTaggedTemplate = Array.isArray(strings) && Object.prototype.hasOwnProperty.call(strings, "raw");

    if (isTaggedTemplate) {

        text = strings[0];

        values.forEach((_, i) => {
            text += `$${i + 1}` + strings[i + 1];
        });

        params = values;

    } else {

        // Called as a normal function with a plain string, e.g. sql.query("SELECT ...")
        text = strings;
        params = [];

    }

    const result = await pool.query(text, params);

    // Mimic the mssql result shape (.recordset / .rowsAffected) so
    // controllers barely have to change.
    return {
        recordset: result.rows,
        rowsAffected: [result.rowCount]
    };

}

module.exports = { sql: { query }, pool };
