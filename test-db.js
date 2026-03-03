const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
require('dotenv').config();

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function testDb() {
    console.log('Testing Database connection and write access...');
    try {
        const testToken = await prisma.verificationToken.create({
            data: {
                identifier: 'test@example.com',
                token: 'test-token-' + Date.now(),
                expires: new Date(Date.now() + 1000 * 60 * 60),
            }
        });
        console.log('✅ Successfully wrote to VerificationToken table:', testToken.identifier);

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: testToken.identifier,
                    token: testToken.token
                }
            }
        });
        console.log('✅ Successfully deleted test token.');
    } catch (error) {
        console.error('❌ Database Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDb();
