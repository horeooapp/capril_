/**
 * Standing-alone DB connectivity test using Prisma.
 * Used for deployment diagnostics during PM2 boot failures.
 */
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('--- 🛡️  Database Connectivity Diagnostic ---');
  console.log(`Checking connection string starting with: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.split(':')[0] : 'UNDEFINED'}://...`);

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in process.env');
    process.exit(1);
  }

  try {
    const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://').replace('postgres://', 'http://'));
    console.log(`📡 Host: ${url.hostname}`);
    console.log(`👤 User: ${url.username}`);
  } catch (e) {
    console.log('⚠️  Could not parse DATABASE_URL components.');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('⏳ Connecting to Database...');
    await prisma.$connect();
    console.log('✅ Connection Successful!');
    
    console.log('🧪 Running lightweight query (SELECT 1)...');
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Query Successful!', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ DATABASE CONNECTION FAILED');
    console.error(`Error Code: ${error.code || 'N/A'}`);
    console.error(`Message: ${error.message}`);
    
    if (error.message.includes('protocol')) {
      console.error('⚠️  Protocol Error: Your DATABASE_URL format is likely invalid.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
