require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.AUTH_RESEND_KEY);

async function testResend() {
    console.log(`Using API Key: ${process.env.AUTH_RESEND_KEY}`);
    console.log("Sending test email...");

    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: 'christopher.crn@yopmail.com', // Let's use a yopmail address to test
            subject: 'Test Resend API',
            html: '<p>Direct test script for <strong>Resend</strong>!</p>'
        });

        console.log("✅ Success! Response data:", data);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

testResend();
