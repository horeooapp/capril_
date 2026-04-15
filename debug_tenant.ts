import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
        const users = await prisma.user.findMany({
            where: { email: { contains: 'ekissi' } }
        });
        console.log('Users matching ekissi:', users.map(u => ({ id: u.id, email: u.email })));
        
        if (users.length > 0) {
            const leases = await prisma.lease.findMany({
                where: { tenantId: users[0].id }
            });
            console.log('Leases for first match:', leases);
        }


    // Check if the user is linked via another field or phone logic
}

main().catch(console.error).finally(() => prisma.$disconnect());
