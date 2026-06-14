import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

// Marquer les messages comme LUS
export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json();
        let { leaseId } = body;
        const { role } = body;

        if (!leaseId) {
            const activeLease = await prisma.lease.findFirst({
                where: { tenantId: user.userId, status: 'ACTIVE' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            } else {
                return NextResponse.json({ error: "leaseId est requis" }, { status: 400 });
            }
        }

        // On met à jour tous les messages du bail où l'expéditeur n'est PAS le rôle actuel
        // (ex: si le locataire ouvre le chat, il lit les messages envoyés par le proprio)
        const targetRole = role === 'LOCATAIRE' ? 'PROPRIO' : 'LOCATAIRE';

        await prisma.messagerieBail.updateMany({
            where: {
                leaseId: leaseId,
                roleExpediteur: targetRole,
                statut: { not: 'LU' }
            },
            data: {
                statut: 'LU',
                dateLecture: new Date()
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[MOBILE API] chat read error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
