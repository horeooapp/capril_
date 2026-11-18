import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

// Marquer les messages comme LUS
export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json().catch(() => ({}));
        let { leaseId } = body;

        if (!leaseId) {
            const activeLease = await prisma.lease.findFirst({
                where: {
                    OR: [
                        { tenantId: user.userId },
                        { landlordId: user.userId },
                        { property: { ownerUserId: user.userId } },
                        { property: { managedByUserId: user.userId } }
                    ],
                    status: { notIn: ['CANCELLED', 'ARCHIVED'] }
                },
                orderBy: { updatedAt: 'desc' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            } else {
                return NextResponse.json({ success: true, message: "Aucun bail actif" });
            }
        }

        // Marquer tous les messages de ce bail dont l'expéditeur n'est PAS l'utilisateur actuel comme LUS
        await prisma.messagerieBail.updateMany({
            where: {
                leaseId: leaseId,
                expediteurId: { not: user.userId },
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
