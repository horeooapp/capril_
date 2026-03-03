const { prisma } = require('./src/lib/prisma');

async function checkAdapter() {
    try {
        console.log("Checking if Prisma can connect correctly...");
        // This is essentially what NextAuth PrismaAdapter attempts when finding a user
        const testUser = await prisma.user.findFirst();
        console.log("Test user response:", testUser ? "Found" : "Not Found");
    } catch (e) {
        console.error("Prisma Connection Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdapter();
