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

        // Tester vers Yopmail (une autre boîte de réception publique)
        const testEmail = "qapril-test-123@yopmail.com";
        const mailOptions = {
            to: testEmail,
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            subject: "Test Delivery QAPRIL " + Date.now(),
            text: "Hello, this is a test to Yopmail.",
            html: '<p>Hello, this is a test to Yopmail.</p>'
        };

        console.log("Sending test email to Yopmail:", testEmail);
        const result = await transport.sendMail(mailOptions);
        console.log("✅ Sent to Yopmail:", result.messageId);

        console.log("\nVeuillez aller sur : https://yopmail.com/fr/ et taper 'qapril-test-123' dans la barre de recherche pour voir si le mail arrive.");

    } catch (e) {
        console.error("❌ Error:", e);
    }
}

testDelivery();
