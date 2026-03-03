const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function testSmtp() {
    console.log('Testing SMTP configuration:');
    console.log('EMAIL_SERVER:', process.env.EMAIL_SERVER ? 'SET' : 'NOT SET');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    if (!process.env.EMAIL_SERVER) {
        console.error('ERROR: EMAIL_SERVER is not defined in .env');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 587,
            secure: false, // STARTTLS
            auth: {
                user: "noreply@qapril.net",
                pass: "Qapmail_2026",
            },
            tls: {
                rejectUnauthorized: false // Helps in some environments
            }
        });

        console.log('Verifying connection on port 587...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_FROM, // Send to self
            subject: 'QAPRIL SMTP Test',
            text: 'This is a test email to verify SMTP configuration.',
            html: '<b>This is a test email to verify SMTP configuration.</b>',
        });

        console.log('✅ Email sent: %s', info.messageId);
    } catch (error) {
        console.error('❌ SMTP Error:', error);
    }
}

testSmtp();
