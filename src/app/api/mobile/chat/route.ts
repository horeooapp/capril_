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
            // Si pas de leaseId, on essaie de trouver le bail actif si c'est un locataire
            const activeLease = await prisma.lease.findFirst({
                where: { tenantId: user.userId, status: 'ACTIVE' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            } else {
                return NextResponse.json({ error: "leaseId est requis ou aucun bail actif trouvé" }, { status: 400 });
            }
        }

        // Vérifier que l'utilisateur a le droit de lire ce bail
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease || (lease.tenantId !== user.userId && lease.property.landlordId !== user.userId)) {
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
        let { leaseId, contenu, role } = body;

        if (!leaseId) {
            const activeLease = await prisma.lease.findFirst({
                where: { tenantId: user.userId, status: 'ACTIVE' }
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
