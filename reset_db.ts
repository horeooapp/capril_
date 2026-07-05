import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt-ts';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting the database...');

    // Fetch all tables
    const tablenames = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    
    // Truncate all tables except migrations
    for (const { tablename } of tablenames as any[]) {
        if (tablename !== '_prisma_migrations') {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
            } catch (error) {
                console.log(`Failed to truncate ${tablename}:`, error);
            }
        }
    }

    console.log('Database truncated.');

    const adminEmail = 'admin@qapril.ci';
    const adminPassword = 'Home@set2026';
    const hashed = await bcrypt.hash(adminPassword, 10);

    console.log(`Recreating admin account: ${adminEmail}`);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
            password: hashed,
            firstName: 'Super',
            lastName: 'Admin',
            isCertified: true,
            onboardingComplete: true
        },
        create: {
            email: adminEmail,
            role: 'ADMIN',
            password: hashed,
            firstName: 'Super',
            lastName: 'Admin',
            isCertified: true,
            onboardingComplete: true
        }
    });

    console.log('✅ Admin user created:', {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
