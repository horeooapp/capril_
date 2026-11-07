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

export async function PATCH(request: Request) {
    try {
        const userPayload = await authenticateMobileRequest(request);
        
        if (!userPayload) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: "Adresse e-mail requise." }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ error: "Veuillez saisir une adresse e-mail valide." }, { status: 400 });
        }

        // Unicité de l'e-mail
        const existing = await prisma.user.findFirst({
            where: {
                email: normalizedEmail,
                id: { not: userPayload.userId }
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Cette adresse e-mail est déjà associée à un autre compte QAPRIL." }, 
                { status: 409 }
            );
        }

        const updated = await prisma.user.update({
            where: { id: userPayload.userId },
            data: { email: normalizedEmail },
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

        return NextResponse.json({ 
            success: true, 
            message: "Adresse e-mail mise à jour avec succès.",
            user: updated 
        });

    } catch (error: any) {
        console.error("[MOBILE API] auth/me PATCH error:", error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour de l'adresse e-mail." }, { status: 500 });
    }
}
