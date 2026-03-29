const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const user = await prisma.user.findFirst({
            where: { 
                email: 'admin@qapril.ci',
                role: { in: ['ADMIN', 'SUPER_ADMIN'] }
            }
        });
        console.log("Success", user);
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e.message);
    }
}
test();
