const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Setting up unique CI index on property...");
    await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unit_label_unique_ci 
        ON properties (parent_property_id, LOWER(unit_label)) 
        WHERE parent_property_id IS NOT NULL AND unit_label IS NOT NULL;
    `);
    console.log("✅ Index created successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
