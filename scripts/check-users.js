const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            take: 5,
            select: { email: true, role: true }
        });
        console.log("USERS_SAMPLE:" + JSON.stringify(users));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
