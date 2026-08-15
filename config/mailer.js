const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(toEmail, resetUrl) {

    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: "Reset your Data Pirates password",
        html: `
            <p>We received a request to reset your Data Pirates password.</p>

            <p>
                <a href="${resetUrl}">
                    Click here to reset your password
                </a>
            </p>

            <p>
                This link expires in 1 hour.
                If you didn't request this, you can safely ignore this email.
            </p>
        `
    });

}

module.exports = { sendPasswordResetEmail };