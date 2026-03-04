import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testEmail() {
    console.log("Starting email test (Port 465)...");
    const smtpOptionsString = process.env.EMAIL_SERVER || "";

    let urlObj;
    try {
        urlObj = new URL(smtpOptionsString);
    } catch (e) {
        console.error("Invalid SMTP URL", e);
        return;
    }

    const smtpOptions = {
        host: urlObj.hostname,
        port: 465, // Force 465
        secure: true, // Force true for 465
        auth: {
            user: decodeURIComponent(urlObj.username),
            pass: decodeURIComponent(urlObj.password)
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10s timeout
        greetingTimeout: 10000,
        socketTimeout: 10000,
    };

    console.log("Parsed Options:", { ...smtpOptions, auth: { ...smtpOptions.auth, pass: '***' } });

    const transport = createTransport(smtpOptions);

    try {
        console.log("Verifying connection...");
        await transport.verify();
        console.log("SMTP connection verified successfully.");

        console.log("Sending mail...");
        const result = await transport.sendMail({
            to: "heckin.shiba@gmail.com",
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            subject: `Test d'e-mail QApril (Port 465)`,
            text: `Ceci est un test`,
            html: `<p>Test d'e-mail avec le port 465.</p>`,
        });

        console.log("Mail sent result:", result);
    } catch (e) {
        console.error("SMTP Error:", e);
    }
}

testEmail();
