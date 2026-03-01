const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function promote(email, password) {
    if (!email) {
        console.error("Usage: node prisma/promote.js <email> [password]");
        process.exit(1);
    }

    try {
        const updateData = { role: 'ADMIN' };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { email: email.trim().toLowerCase() },
            data: updateData,
        });
        console.log(`✅ Success: User ${user.email} is now an ADMIN ${password ? 'with password set' : ''}.`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`❌ Error: User with email "${email}" not found.`);
        } else {
            console.error("❌ Error updating user:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
const password = process.argv[3];
promote(email, password);
