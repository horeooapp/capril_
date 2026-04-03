import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'UNDEFINED';
  // Obfuscate the middle part so we don't leak secrets, but we can see the start and end.
  const maskedDbUrl = dbUrl.length > 20 
    ? dbUrl.substring(0, 15) + '...***...' + dbUrl.substring(dbUrl.length - 10)
    : dbUrl;
    
  return NextResponse.json({
    databaseUrl: maskedDbUrl,
    hasQuotes: dbUrl.startsWith('"') || dbUrl.startsWith("'"),
    protocol: dbUrl.split('://')[0],
    isUrlEmpty: dbUrl === '' || dbUrl === 'UNDEFINED',
    nodeEnv: process.env.NODE_ENV,
    standalone: process.env.__NEXT_PRIVATE_STANDALONE,
    authSecret: process.env.AUTH_SECRET ? 'DEFINED' : 'UNDEFINED',
  });
}
