import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';
import { prisma } from './prisma';
import { auth } from '@/auth';

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'qapril-mobile-emergency-secret-2026';
const ALGORITHM_RSA = 'RS256';
const ALGORITHM_HS = 'HS256';

/**
 * Sign a JWT for a user id and role
 */
export async function signJWT(payload: { userId: string; role: string }) {
  try {
    // 1. Preferred Method: RS256 (Asymmetric)
    if (PRIVATE_KEY) {
      console.log('[JWT] Using RS256 Signing (Asymmetric)');
      const privateKeyString = PRIVATE_KEY.replace(/\\n/g, '\n');
      const privateKey = await importPKCS8(privateKeyString, ALGORITHM_RSA);
      
      return new SignJWT(payload)
        .setProtectedHeader({ alg: ALGORITHM_RSA })
        .setIssuedAt()
        .setExpirationTime('72h')
        .sign(privateKey);
    }

    // 2. Fallback Method: HS256 (Symmetric) - More resilient to env config issues
    console.warn('[JWT] MISSING RSA KEYS. Falling back to HS256 (Symmetric)');
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    return new SignJWT(payload)
      .setProtectedHeader({ alg: ALGORITHM_HS })
      .setIssuedAt()
      .setExpirationTime('72h')
      .sign(secret);
      
  } catch (error: any) {
    console.error('[JWT] Signing failed:', error.message);
    throw error;
  }
}

/**
 * Verify a JWT and return the payload
 */
export async function verifyJWT(token: string) {
  try {
    // Attempt RSA Verification if Public Key exists
    if (PUBLIC_KEY) {
      const publicKeyString = PUBLIC_KEY.replace(/\\n/g, '\n');
      const publicKey = await importSPKI(publicKeyString, ALGORITHM_RSA);
      
      const { payload } = await jwtVerify(token, publicKey, {
        algorithms: [ALGORITHM_RSA],
      });
      return payload as { userId: string; role: string };
    }
  } catch (e) {
    // Fallback to HS256 if RSA fails or is missing
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM_HS],
    });
    return payload as { userId: string; role: string };
  } catch (error) {
    console.error('[JWT] Verification failed:', error);
    return null;
  }
}

/**
 * Helper for API routes to get user from Authorization header
 */
export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  // 1. JWT Strategy (Mobile / Bearer)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token);
    
    if (decoded && decoded.userId) {
      return await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          fullName: true,
          status: true,
          onboardingComplete: true
        }
      });
    }
  }

  // 2. Session Strategy (Web / Cookie)
  const session = await auth();
  if (session?.user?.id) {
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        fullName: true,
        status: true,
        onboardingComplete: true
      }
    });
  }

  return null;
}
