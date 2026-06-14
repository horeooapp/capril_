import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const userPayload = await authenticateMobileRequest(request);
        
        if (!userPayload) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userPayload.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                kycLevel: true,
                kycStatus: true,
                isCertified: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
        }

        return NextResponse.json({ user });

    } catch (error: any) {
        console.error("[MOBILE API] auth/me error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
