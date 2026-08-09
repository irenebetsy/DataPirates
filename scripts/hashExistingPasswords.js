// One-time migration script: hashes any plaintext passwords still sitting in
// the SiteUsers table (accounts registered before bcrypt was added).
//
// Safe to run more than once - it detects passwords that are ALREADY a
// bcrypt hash (they start with $2a$, $2b$, or $2y$) and skips them, so it
// will never double-hash an already-secure password.
//
// Usage:
//   cd DataPirates/backend
//   node scripts/hashExistingPasswords.js

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sql, pool } = require("../config/db");

const SALT_ROUNDS = 10;
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;

async function run() {

    console.log("Connecting to database...");

    const result = await sql.query`SELECT "UserID", "Email", "Password" FROM "SiteUsers"`;

    const users = result.recordset;

    console.log(`Found ${users.length} SiteUsers account(s).`);

    let hashedCount = 0;
    let skippedCount = 0;
    let suspiciousCount = 0;

    for (const user of users) {

        const currentPassword = user.Password || "";

        if (BCRYPT_PATTERN.test(currentPassword)) {

            skippedCount++;
            continue;

        }

        // A password that isn't valid-looking plain text (contains control
        // characters / looks like garbled binary) probably came from
        // something like PWDENCRYPT() rather than a real plaintext password.
        // We can still technically bcrypt-hash whatever bytes are there so
        // login stops crashing, but the ORIGINAL password is not recoverable
        // - that account will need a real password reset regardless.
        const looksGarbled = /[\x00-\x08\x0E-\x1F]/.test(currentPassword);

        if (looksGarbled) {
            suspiciousCount++;
            console.log(`⚠️  UserID ${user.UserID} (${user.Email}) has a garbled/corrupted password value - hashing it anyway, but this account will need "Forgot Password" to get a real, usable password.`);
        }

        const newHash = await bcrypt.hash(currentPassword, SALT_ROUNDS);

        await sql.query`
            UPDATE "SiteUsers" SET "Password" = ${newHash}
            WHERE "UserID" = ${user.UserID}
        `;

        hashedCount++;

        console.log(`✅ Hashed password for UserID ${user.UserID} (${user.Email})`);

    }

    console.log("=======================================");
    console.log(`Done. Hashed: ${hashedCount}, already secure (skipped): ${skippedCount}, garbled/corrupted: ${suspiciousCount}`);

    if (suspiciousCount > 0) {
        console.log("Accounts flagged above will need to use 'Forgot Password' to set a real, working password - their original password could not be recovered.");
    }

    console.log("=======================================");

    await pool.end();

    process.exit(0);

}

run().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
