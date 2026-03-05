require('dotenv').config();
const { createTransport } = require("nodemailer");

async function testNodeMailer() {
    let smtpOptions = process.env.EMAIL_SERVER;
    console.log("Original EMAIL_SERVER:", smtpOptions);

    if (typeof smtpOptions === 'string') {
        const urlObj = new URL(smtpOptions);
        smtpOptions = {
            host: urlObj.hostname,
            port: urlObj.port ? parseInt(urlObj.port) : 587,
            secure: urlObj.port === '465', // false pour 587 (STARTTLS)
            auth: {
                user: decodeURIComponent(urlObj.username),
                pass: decodeURIComponent(urlObj.password)
            },
            tls: {
                rejectUnauthorized: false
            }
        };
    }

    console.log("Parsed smtpOptions:", smtpOptions);

    try {
        const transport = createTransport(smtpOptions);
        console.log("Transport created, validating...");
        await transport.verify();
        console.log("Transport verified!");

        const mailOptions = {
            to: process.env.EMAIL_FROM, // Send to self
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            subject: "Test Auth.ts Config",
            text: "Hello, this is a test from Auth.ts format",
        };

        const result = await transport.sendMail(mailOptions);
        console.log("✅ Sent:", result.messageId);
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

testNodeMailer();
