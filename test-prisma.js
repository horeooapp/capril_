const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
require('dotenv').config();

async function testPrisma() {
    console.log("Testing Prisma connection...");
    try {
        let adapter = null;
        let finalUrl = process.env.DATABASE_URL || "file:./dev.db";

        if (finalUrl && finalUrl.startsWith("file:")) {
            const dbPath = require("path").join(process.cwd(), "dev.db");
            finalUrl = "file:" + dbPath;
            console.log("[PRISMA DEBUG] Resolved Absolute DB Path:", finalUrl);
        }

        const prisma = new PrismaClient({
            datasources: {
                db: { url: finalUrl }
            }
        });

        console.log("Prisma client created. Looking for users...");
        const users = await prisma.user.findMany({ take: 1 });
        console.log("Users found:", users);
        await prisma.$disconnect();
    } catch (e) {
        console.error("Prisma Error:", e);
    }
}

testPrisma();
