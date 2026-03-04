require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testStandardPrisma() {
    console.log("Testing STANDARD Prisma...");
    try {
        const prisma = new PrismaClient();

        console.log("Database connected. Creating a test verification token...");

        const token = await prisma.verificationToken.create({
            data: {
                identifier: "test@domain.com",
                token: "dummy-token-" + Date.now(),
                expires: new Date(Date.now() + 1000 * 60 * 60)
            }
        });
        console.log("✅ Token successfully created:", token);

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: "test@domain.com",
                    token: token.token
                }
            }
        });
        console.log("✅ Token deleted.");
    } catch (e) {
        console.error("❌ Prisma Error:", e);
    }
}

testStandardPrisma();
