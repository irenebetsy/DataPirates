const https = require("https");

async function sendPasswordResetEmail(toEmail, resetUrl) {
    const data = JSON.stringify({
        sender: {
            name: "DataPirates",
            email: process.env.MAIL_FROM
        },
        to: [
            {
                email: toEmail
            }
        ],
        subject: "Reset your Data Pirates password",
        htmlContent: `
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

    const options = {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json",
            "content-length": Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log("BREVO EMAIL SENT:", body);
                    resolve();
                } else {
                    console.error("BREVO ERROR:", res.statusCode, body);
                    reject(new Error(`Brevo email failed: ${body}`));
                }
            });
        });

        req.on("error", (error) => {
            console.error("BREVO CONNECTION ERROR:", error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

module.exports = { sendPasswordResetEmail };