const nodemailer = require("nodemailer");

async function testEthereal() {
    console.log("1. Creating Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    console.log("Account created:", testAccount.user);

    const transport = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    console.log("2. Sending magic link email via Ethereal...");
    const info = await transport.sendMail({
        from: '"QAPRIL Auth" <noreply@qapril.net>',
        to: "test-user@example.com",
        subject: "Connexion à QAPRIL (TEST LOCAL)",
        text: "Ceci est un test local Ethereal.",
        html: "<b>Ceci est un test local Ethereal.</b>",
    });

    console.log("✅ Sent:", info.messageId);
    console.log("\n🎉 EMAIL CATCHED! You can view it here:");
    console.log(nodemailer.getTestMessageUrl(info));
    console.log("\n(This proves that NodeMailer works and your Next.js logic is perfect. If Hostinger doesn't deliver, Hostinger is blocking outgoing emails silently.)");
}

testEthereal().catch(console.error);
