const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const user = await prisma.user.findFirst({
            where: { 
                email: 'test@qapril.ci',
                OR: [
                    { role: 'ADMIN' },
                    { role: 'SUPER_ADMIN' }
                ]
            }
        });
        console.log("Success", user);
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}
test();
