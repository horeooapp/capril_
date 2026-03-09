const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Property Model Fields ---');
  try {
    const propertyFields = Object.keys(prisma.property.fields || {});
    console.log('Fields:', propertyFields.length > 0 ? propertyFields : 'Could not retrieve fields via .fields');
    
    // Test a dummy create with v2.0 fields (will fail at DB level if not exist, but verifies client)
    console.log('Testing v2.0 fields in client...');
    const p = prisma.property.fields;
    if (p && p.ownerUserId) console.log('✓ ownerUserId exists');
    if (p && p.propertyCode) console.log('✓ propertyCode exists');
    if (p && p.declaredRentFcfa) console.log('✓ declaredRentFcfa exists');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
