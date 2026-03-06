const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

async function checkTokens() {
    console.log("Checking database for VerificationTokens...");
    try {
        const tokens = await prisma.verificationToken.findMany({
            orderBy: { expires: 'desc' },
            take: 5
        });

        console.log(`Found ${tokens.length} recent tokens.`);
        tokens.forEach(t => {
            console.log(`- Identifier: ${t.identifier}`);
            console.log(`  Expires: ${t.expires}`);
            console.log(`  Token starts with: ${t.token.substring(0, 10)}...`);
            console.log(`  Is Expired: ${t.expires < new Date()}`);
        });

    } catch (error) {
        console.error("Error querying database:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkTokens();
