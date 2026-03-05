require('dotenv').config();
const { createTransport } = require("nodemailer");

async function testDelivery() {
    let smtpOptions = process.env.EMAIL_SERVER;

    if (typeof smtpOptions === 'string') {
        const urlObj = new URL(smtpOptions);
        smtpOptions = {
            host: urlObj.hostname,
            port: urlObj.port ? parseInt(urlObj.port) : 587,
            secure: urlObj.port === '465',
            auth: {
                user: decodeURIComponent(urlObj.username),
                pass: decodeURIComponent(urlObj.password)
            },
            tls: {
                rejectUnauthorized: false
            }
        };
    }

    try {
        const transport = createTransport(smtpOptions);

        const testEmail = "qapril-test-123@mailinator.com";
        const mailOptions = {
            to: testEmail,
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            subject: "Test Delivery QAPRIL",
            text: "Hello, this is a test to see if emails are actually leaving Hostinger SMTP and reaching external inboxes.",
            html: '<p>Hello, this is a test to see if emails are actually leaving Hostinger SMTP and reaching external inboxes.</p>'
        };

        console.log("Sending test email to:", testEmail);
        const result = await transport.sendMail(mailOptions);
        console.log("✅ Sent:", result.messageId);
        console.log("You can check the inbox at: https://www.mailinator.com/v2/inbox.jsp?zone=public&query=qapril-test-123");
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

testDelivery();
