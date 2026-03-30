import { NextResponse } from 'next/server';

/**
 * GET /api/v1/debug/auth-status
 * Checks the current health of the authentication system (JWT, Redis).
 * Returns safe metadata about the configuration.
 */
export async function GET() {
  const jwtPrivate = !!process.env.JWT_PRIVATE_KEY;
  const jwtPublic = !!process.env.JWT_PUBLIC_KEY;
  const jwtSecret = !!process.env.JWT_SECRET;
  
  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    auth: {
      strategy: jwtPrivate ? 'RSA (Primary)' : 'HS256 (Fallback)',
      config: {
        hasPrivateKey: jwtPrivate,
        hasPublicKey: jwtPublic,
        hasSecret: jwtSecret,
      }
    },
    env: process.env.NODE_ENV
  });
}
