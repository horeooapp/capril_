import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

// Récupérer les messages
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const url = new URL(request.url);
        let leaseId = url.searchParams.get('leaseId');

        if (!leaseId) {
            // Trouver le bail actif associé à l'utilisateur (locataire ou bailleur)
            const activeLease = await prisma.lease.findFirst({
                where: {
                    OR: [
                        { tenantId: user.userId },
                        { property: { ownerUserId: user.userId } },
                        { property: { landlordId: user.userId } }
                    ],
                    status: 'ACTIVE'
                },
                orderBy: { createdAt: 'desc' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            } else {
                return NextResponse.json({ messages: [] });
            }
        }

        // Vérifier que l'utilisateur a le droit de lire ce bail
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease || (lease.tenantId !== user.userId && lease.property.landlordId !== user.userId && lease.property.ownerUserId !== user.userId)) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const messages = await prisma.messagerieBail.findMany({
            where: { leaseId },
            orderBy: { dateEnvoi: 'asc' }
        });

        return NextResponse.json({ messages });

    } catch (error) {
        console.error("[MOBILE API] chat GET error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

// Envoyer un nouveau message
export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json();
        let { leaseId } = body;
        const { contenu, role } = body;

        if (!leaseId) {
            const activeLease = await prisma.lease.findFirst({
                where: {
                    OR: [
                        { tenantId: user.userId },
                        { property: { ownerUserId: user.userId } },
                        { property: { landlordId: user.userId } }
                    ],
                    status: 'ACTIVE'
                },
                orderBy: { createdAt: 'desc' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            }
        }

        if (!leaseId || !contenu) {
            return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }

        const newMessage = await prisma.messagerieBail.create({
            data: {
                leaseId,
                contenu,
                expediteurId: user.userId,
                roleExpediteur: role || 'SYSTEME', // PROPRIO | LOCATAIRE
                statut: 'ENVOYE'
            }
        });

        return NextResponse.json({ message: newMessage });

    } catch (error) {
        console.error("[MOBILE API] chat POST error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
