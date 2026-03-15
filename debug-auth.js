const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        console.log("--- DEBUG START ---");
        const email = 'admin@qapril.net';
        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            console.log(`User ${email} NOT FOUND in database.`);
            const allAdmins = await prisma.user.findMany({
                where: { role: 'ADMIN' },
                select: { email: true, role: true }
            });
            console.log("Current ADMINs:", allAdmins);
        } else {
            console.log(`User ${email} FOUND.`);
            console.log(`Role: ${user.role}`);
            console.log(`Has password: ${!!user.password}`);
            
            // Check password hash (bcrypt)
            const { compare } = require('bcrypt-ts');
            const isValid = await compare('adminPassword123!', user.password);
            console.log(`Password 'adminPassword123!' isValid for this hash: ${isValid}`);
        }
        console.log("--- DEBUG END ---");
    } catch (error) {
        console.error("Debug Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
