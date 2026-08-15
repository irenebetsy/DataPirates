const nodemailer = require("nodemailer");

// Reads SMTP settings from .env. See .env.example for what's needed.
// If SMTP isn't configured, we log the reset link to the console instead of
// failing outright - handy for local development without a real mail setup.

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000

    });

}

async function sendPasswordResetEmail(toEmail, resetUrl) {

    if (!transporter) {

        console.log("=======================================");
        console.log("⚠️  SMTP not configured - printing reset link instead of emailing it.");
        console.log(`To: ${toEmail}`);
        console.log(`Reset link: ${resetUrl}`);
        console.log("Fill in SMTP_HOST / SMTP_USER / SMTP_PASS in .env to send real emails.");
        console.log("=======================================");

        return;

    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject: "Reset your Data Pirates password",
        html: `
            <p>We received a request to reset your Data Pirates password.</p>
            <p><a href="${resetUrl}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        `
    });

}

module.exports = { sendPasswordResetEmail };
