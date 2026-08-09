const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sql } = require("../config/db");
const { sendPasswordResetEmail } = require("../config/mailer");

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are all required"
            });
        }

        const existing = await sql.query`
            SELECT "UserID" FROM "SiteUsers" WHERE "Email" = ${email}
        `;

        if (existing.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await sql.query`
            INSERT INTO "SiteUsers" ("Name", "Email", "Password")
            VALUES (${name}, ${email}, ${hashedPassword})
            RETURNING "UserID", "Name", "Email"
        `;

        const user = result.recordset[0];

        res.json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user.UserID,
                name: user.Name,
                email: user.Email
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await sql.query`
            SELECT "UserID", "Name", "Email", "Password"
            FROM "SiteUsers"
            WHERE "Email" = ${email}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = result.recordset[0];

        const passwordMatches = await bcrypt.compare(password, user.Password);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user.UserID,
                name: user.Name,
                email: user.Email
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// FORGOT PASSWORD - request a reset link
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await sql.query`
            SELECT "UserID", "Name" FROM "SiteUsers" WHERE "Email" = ${email}
        `;

        // Always respond the same way whether or not the email exists,
        // so people can't use this to figure out who has an account.
        const genericResponse = {
            success: true,
            message: "If an account exists for that email, a reset link has been sent."
        };

        if (result.recordset.length === 0) {
            return res.json(genericResponse);
        }

        const user = result.recordset[0];

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

        await sql.query`
            INSERT INTO "PasswordResets" ("UserID", "Token", "ExpiresAt")
            VALUES (${user.UserID}, ${token}, ${expiresAt})
        `;

        const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
        const resetUrl = `${baseUrl}/reset-password.html?token=${token}`;

        await sendPasswordResetEmail(email, resetUrl);

        res.json(genericResponse);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// RESET PASSWORD - use the token from the emailed link
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });
        }

        const result = await sql.query`
            SELECT "ResetID", "UserID", "ExpiresAt"
            FROM "PasswordResets"
            WHERE "Token" = ${token}
        `;

        if (result.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "This reset link is invalid or has already been used."
            });
        }

        const resetRequest = result.recordset[0];

        if (new Date(resetRequest.ExpiresAt) < new Date()) {

            await sql.query`DELETE FROM "PasswordResets" WHERE "ResetID" = ${resetRequest.ResetID}`;

            return res.status(400).json({
                success: false,
                message: "This reset link has expired. Please request a new one."
            });

        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await sql.query`
            UPDATE "SiteUsers" SET "Password" = ${hashedPassword}
            WHERE "UserID" = ${resetRequest.UserID}
        `;

        // Invalidate the token so it can't be reused
        await sql.query`DELETE FROM "PasswordResets" WHERE "ResetID" = ${resetRequest.ResetID}`;

        res.json({
            success: true,
            message: "Password updated successfully. You can now sign in."
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};
