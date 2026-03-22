const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'SUPER_ADMIN'] }
            },
            select: {
                id: true,
                email: true,
                role: true,
                password: true
            }
        });
        console.log('Found admins:', users.length);
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, HasPassword: ${!!u.password}`);
        });
    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
