const nodemailer = require('nodemailer');
require('dotenv').config();

async function testNextAuthString() {
    let smtpConfig = process.env.EMAIL_SERVER;
    if (typeof smtpConfig === 'string' && !smtpConfig.includes("tls.rejectUnauthorized")) {
        smtpConfig += smtpConfig.includes("?") ? "&tls.rejectUnauthorized=false" : "?tls.rejectUnauthorized=false";
    }

    console.log("Testing string config:", smtpConfig);

    try {
        const transport = nodemailer.createTransport(smtpConfig);
        console.log("Transport created, verifying...");

        await transport.verify();
        console.log("✅ Verified!");

        const info = await transport.sendMail({
            to: process.env.EMAIL_FROM,
            from: process.env.EMAIL_FROM,
            subject: "Test String Config",
            text: "Hello"
        });
        console.log("✅ Sent:", info.messageId);
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

testNextAuthString();
