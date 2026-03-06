require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.AUTH_RESEND_KEY);

async function testResendVerified() {
    console.log("Using API Key: YES");
    console.log(`Sending from: ${process.env.EMAIL_FROM}`);
    console.log("Sending test email to: christopher.crn@yopmail.com");

    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: 'christopher.crn@yopmail.com',
            subject: 'Test Resend API - Verified Domain',
            html: '<p>Direct test script for <strong>Resend</strong> with Verified Domain!</p>'
        });

        console.log("✅ Success! Response data:", data);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

testResendVerified();
