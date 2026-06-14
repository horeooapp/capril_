import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const getJwtSecretKey = () => {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length === 0) {
        throw new Error('La variable d\'environnement AUTH_SECRET n\'est pas définie.');
    }
    return new TextEncoder().encode(secret);
};

export async function signMobileToken(payload: { userId: string; email: string; role: string }) {
    try {
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d') // Jeton valide 30 jours sur mobile
            .sign(getJwtSecretKey());
        return token;
    } catch (error) {
        console.error("Erreur de signature JWT:", error);
        throw new Error("Impossible de générer le jeton.");
    }
}

export async function verifyMobileToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        return payload as { userId: string; email: string; role: string };
    } catch (error) {
        return null;
    }
}

// Helper pour les routes API
export async function authenticateMobileRequest(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyMobileToken(token);
    
    return decoded;
}
