require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function check() {
    console.log("Current DATABASE_URL from .env:", process.env.DATABASE_URL);
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findFirst();
        console.log("Found user?", user);
    } catch (e) {
        console.error("Prisma error:", e);
    }
}
check();
