const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(toEmail, resetUrl) {

    const { data, error } = await resend.emails.send({
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

    if (error) {
        console.error("RESEND ERROR:", error);
        throw new Error(error.message);
    }

    console.log("RESEND EMAIL SENT:", data);
}

module.exports = { sendPasswordResetEmail };