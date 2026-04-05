import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
    console.log('Initiating database reset...');

    // 1. Fetch current admin@capril.ci to preserve it (if it exists)
    let admin = await prisma.user.findFirst({ 
        where: { email: 'admin@capril.ci' } 
    });

    // 2. Truncate all tables
    const tables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname='public' 
        AND tablename NOT IN ('_prisma_migrations');
    `);

    console.log(`Found ${tables.length} tables to truncate.`);

    for (const { tablename } of tables) {
        console.log(`Truncating ${tablename}...`);
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }

    console.log('Database purged successfully.');

    // 3. Restore or create admin@capril.ci
    if (admin) {
        console.log('Restoring preserved admin@capril.ci user...');
        await prisma.user.create({ data: admin });
    } else {
        console.log('Admin user not found. Creating a fresh admin@capril.ci user...');
        const hashedPassword = await bcrypt.hash('Home@set2026', 10);
        await prisma.user.create({
            data: {
                email: 'admin@capril.ci',
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'ADMIN', // Or SUPER_ADMIN depending on the schema
                status: 'active'
            }
        });
    }

    console.log('Reset complete. Only admin@capril.ci remains.');
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
