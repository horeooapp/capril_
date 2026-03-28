import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';
import { prisma } from './prisma';

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
const ALGORITHM = 'RS256';

/**
 * Sign a JWT for a user id and role
 */
export async function signJWT(payload: { userId: string; role: string }) {
  if (!PRIVATE_KEY) {
    throw new Error('JWT_PRIVATE_KEY is not defined in environment variables');
  }

  // Handle keys with escaped newlines from .env
  const privateKeyString = PRIVATE_KEY.replace(/\\n/g, '\n');
  const privateKey = await importPKCS8(privateKeyString, ALGORITHM);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('72h') // Réf. QAPRIL/API-MAP duration
    .sign(privateKey);
}

/**
 * Verify a JWT and return the payload
 */
export async function verifyJWT(token: string) {
  if (!PUBLIC_KEY) {
    throw new Error('JWT_PUBLIC_KEY is not defined in environment variables');
  }

  const publicKeyString = PUBLIC_KEY.replace(/\\n/g, '\n');
  const publicKey = await importSPKI(publicKeyString, ALGORITHM);

  try {
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: [ALGORITHM],
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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyJWT(token);
  
  if (!decoded || !decoded.userId) {
    return null;
  }

  // Fetch full user from DB
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
