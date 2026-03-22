const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@qapril.net';
    const password = 'Admin@qapsec2026!';
    
    // Dynamic import for bcrypt-ts as it's an ESM module usually
    // but in many node environments it's better to use a version that works for both.
    // Given promote.js used await import, we'll follow that.
    
    let bcrypt;
    try {
        bcrypt = await import('bcrypt-ts');
    } catch (e) {
        // Fallback for some node versions or CommonJS context
        try {
            bcrypt = require('bcrypt-ts');
        } catch (e2) {
            console.error("❌ Error: bcrypt-ts not found. Please run 'npm install bcrypt-ts' or check node_modules.");
            process.exit(1);
        }
    }

    console.log(`🚀 Starting admin creation/promotion for: ${email}`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Use upsert to create or update
        // Note: findUnique requires unique email. If not unique in schema, we'll try findFirst then update/create
        const existingUser = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    role: 'ADMIN',
                    password: hashedPassword,
                    status: 'active'
                }
            });
            console.log(`✅ Success: User ${email} has been promoted to ADMIN and password updated.`);
        } else {
            // Need a phone number as it's unique and required in schema
            const dummyPhone = `+2250101010101_admin`; 
            await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    role: 'ADMIN',
                    phone: dummyPhone,
                    fullName: 'Administrateur Central',
                    status: 'active'
                }
            });
            console.log(`✅ Success: User ${email} has been created as ADMIN.`);
        }
    } catch (error) {
        console.error("❌ Error during script execution:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
