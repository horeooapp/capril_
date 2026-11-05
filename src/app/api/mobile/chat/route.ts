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
                        { landlordId: user.userId },
                        { property: { ownerUserId: user.userId } }
                    ],
                    status: 'ACTIVE'
                },
                orderBy: { createdAt: 'desc' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            } else {
                return NextResponse.json({ messages: [], interlocutorName: '', interlocutorRole: '' });
            }
        }

        // Vérifier que l'utilisateur a le droit de lire ce bail
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease || (lease.tenantId !== user.userId && lease.landlordId !== user.userId && lease.property?.ownerUserId !== user.userId)) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // Déterminer l'interlocuteur
        const isTenant = lease.tenantId === user.userId;
        let interlocutorName = isTenant ? 'Bailleur' : 'Locataire';
        let interlocutorRole = isTenant ? 'Bailleur' : 'Locataire';

        if (isTenant) {
            const landlordId = lease.landlordId || lease.property?.ownerUserId;
            if (landlordId) {
                const landlord = await prisma.user.findUnique({
                    where: { id: landlordId },
                    select: { firstName: true, lastName: true }
                });
                if (landlord) {
                    interlocutorName = lease.bailleurMasque
                        ? 'Bailleur certifié'
                        : `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'Bailleur';
                }
            }
        } else {
            if (lease.tenantId) {
                const tenant = await prisma.user.findUnique({
                    where: { id: lease.tenantId },
                    select: { firstName: true, lastName: true }
                });
                if (tenant) {
                    interlocutorName = `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || 'Locataire';
                }
            }
        }

        const messages = await prisma.messagerieBail.findMany({
            where: { leaseId },
            orderBy: { dateEnvoi: 'asc' }
        });

        return NextResponse.json({
            messages,
            interlocutorName,
            interlocutorRole,
            leaseReference: lease.leaseReference,
            propertyName: lease.property?.name || 'Logement'
        });

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

        if (!contenu || !contenu.trim()) {
            return NextResponse.json({ error: "Le contenu du message est requis" }, { status: 400 });
        }

        if (!leaseId) {
            const activeLease = await prisma.lease.findFirst({
                where: {
                    OR: [
                        { tenantId: user.userId },
                        { landlordId: user.userId },
                        { property: { ownerUserId: user.userId } }
                    ],
                    status: 'ACTIVE'
                },
                orderBy: { createdAt: 'desc' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            } else {
                return NextResponse.json({ error: "Aucun bail actif pour associer ce message" }, { status: 400 });
            }
        }

        // Vérification d'accès
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease || (lease.tenantId !== user.userId && lease.landlordId !== user.userId && lease.property?.ownerUserId !== user.userId)) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // Création du message infalsifiable
        const message = await prisma.messagerieBail.create({
            data: {
                leaseId,
                roleExpediteur: role || (lease.tenantId === user.userId ? 'LOCATAIRE' : 'PROPRIO'),
                contenu: contenu.trim(),
                statut: 'RECU', // Immédiatement "reçu" par le serveur central QAPRIL (2 encoches grises)
                dateEnvoi: new Date()
            }
        });

        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error("[MOBILE API] chat POST error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
