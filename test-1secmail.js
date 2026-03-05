require('dotenv').config();
const { createTransport } = require("nodemailer");

async function testDelivery() {
    console.log("1. Generating 1secmail address...");
    try {
        const response = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
        const emails = await response.json();
        const testEmail = emails[0];
        const [login, domain] = testEmail.split('@');
        console.log(`Generated: ${testEmail}`);

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
                tls: { rejectUnauthorized: false }
            };
        }

        const transport = createTransport(smtpOptions);
        console.log("2. Sending test email via Hostinger...");
        const result = await transport.sendMail({
            to: testEmail,
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            subject: "Automated Hostinger Delivery Test",
            text: "This is an automated test to see if external delivery works."
        });
        console.log("✅ Accepted by Hostinger SMTP:", result.messageId);

        console.log("3. Polling 1secmail inbox for 30 seconds...");
        for (let i = 0; i < 15; i++) {
            await new Promise(r => setTimeout(r, 2000));
            try {
                const mailRes = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
                const messages = await mailRes.json();
                if (messages.length > 0) {
                    console.log(`\n🎉 SUCCESS! Email received in inbox! ID: ${messages[0].id}, Subject: ${messages[0].subject}`);
                    return;
                }
            } catch (pollErr) {
                // ignore
            }
            process.stdout.write('.');
        }
        console.log("\n❌ FAIL: Email never arrived in the inbox. Hostinger might be silently dropping outgoing mail.");
    } catch (e) {
        console.error("\n❌ Error:", e);
    }
}

testDelivery();
