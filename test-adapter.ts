import { prisma } from "./src/lib/prisma";

async function checkAdapter() {
    try {
        console.log("Checking if Prisma can connect correctly...");
        const testUser = await prisma.user.findFirst();
        console.log("Test user response:", testUser ? testUser.email : "Not Found");
    } catch (e) {
        console.error("Prisma Connection Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdapter();
