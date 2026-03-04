require('dotenv').config();
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
    console.log("Testing Prisma adapter...");
    try {
        const libsql = createClient({
            url: process.env.DATABASE_URL || "file:../dev.db",
        });
        const adapter = new PrismaLibSQL(libsql);
        const prisma = new PrismaClient({ adapter });

        console.log("Database connected. Creating a test verification token...");

        // Note: Make sure VerificationToken has identifier, token, expires in schema
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

testPrisma();
