require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaAdapter } = require('@auth/prisma-adapter');

async function testAdapter() {
    try {
        console.log("Initializing PrismaClient...");
        const prisma = new PrismaClient();
        const adapter = PrismaAdapter(prisma);

        console.log("1. Simulating getUserByEmail...");
        const user = await adapter.getUserByEmail("noreply@qapril.net");
        console.log("User:", user);

        console.log("2. Simulating createVerificationToken...");
        const token = await adapter.createVerificationToken({
            identifier: "noreply@qapril.net",
            token: "adapter-token-" + Date.now(),
            expires: new Date(Date.now() + 1000 * 60 * 60)
        });

        console.log("✅ Token successfully created:", token);

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: "noreply@qapril.net",
                    token: token.token
                }
            }
        });
        console.log("✅ Token deleted.");
    } catch (e) {
        console.error("❌ Adapter Error Trace:");
        console.error(e);
    }
}

testAdapter();
