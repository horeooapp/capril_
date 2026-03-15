const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt-ts');

async function main() {
    const email = 'admin@qapril.net';
    const password = 'adminPassword123!';

    try {
        console.log(`Creating/Updating admin: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.upsert({
            where: { phone: '0000000001' }, // Phone is the only unique field besides ID
            update: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
                fullName: 'Admin QApril',
                status: 'active'
            },
            create: {
                phone: '0000000001',
                email,
                password: hashedPassword,
                role: 'ADMIN',
                fullName: 'Admin QApril',
                status: 'active'
            }
        });

        console.log(`✅ Admin user ${user.email} is ready.`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
