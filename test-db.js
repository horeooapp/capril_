const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
require('dotenv').config();

let adapter = null;
const url = process.env.DATABASE_URL || "file:./dev.db";

if (url.startsWith("libsql://") || url.startsWith("https://")) {
    const libsql = createClient({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN
    });
    adapter = new PrismaLibSQL(libsql);
}

const prisma = adapter ? new PrismaClient({ adapter }) : new PrismaClient();

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
