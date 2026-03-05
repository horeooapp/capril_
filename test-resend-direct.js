require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.AUTH_RESEND_KEY);

async function testResend() {
    console.log(`Using API Key: ${process.env.AUTH_RESEND_KEY ? "YES (hidden)" : "NO"}`);
    console.log("Sending test email to: cornerstone.ros@gmail.com");

    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: 'cornerstone.ros@gmail.com', // Must be the registered email
            subject: 'Test Resend API - DIRECT',
            html: '<p>Direct test script for <strong>Resend</strong>!</p><p>If you see this, Resend works perfectly.</p>'
        });

        console.log("✅ Success! Response data:", data);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

testResend();
