import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const activeLease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: 'ACTIVE' },
            include: { property: true },
            orderBy: { createdAt: 'desc' }
        });

        let landlordName = 'Bailleur';
        const propertyName = activeLease?.property?.name || 'Votre logement';

        if (activeLease) {
            const landlordId = activeLease.landlordId || activeLease.property?.ownerUserId;
            if (landlordId) {
                const landlord = await prisma.user.findUnique({
                    where: { id: landlordId },
                    select: { firstName: true, lastName: true }
                });
                if (landlord) {
                    landlordName = activeLease.bailleurMasque
                        ? 'Bailleur certifié'
                        : `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'Bailleur';
                }
            }
        }

        const tickets = await prisma.ticketMaintenance.findMany({
            where: { locataireId: user.userId },
            include: {
                logement: { select: { name: true, address: true, commune: true } }
            },
            orderBy: { dateSignalement: 'desc' }
        });

        const formattedTickets = tickets.map(t => ({
            id: t.id,
            ticketRef: t.ticketRef,
            categorie: t.categorie,
            description: t.description,
            statut: t.statut,
            urgence: t.urgence,
            dateSignalement: t.dateSignalement?.toISOString() ?? null,
            bien: t.logement ? `${t.logement.name} · ${t.logement.commune}` : propertyName,
            destinataire: landlordName
        }));

        return NextResponse.json({
            tickets: formattedTickets,
            landlordName,
            propertyName
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/maintenance GET error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const body = await request.json();
        const { category, title, description, hasPhoto } = body;

        if (!title || !description) {
            return NextResponse.json({ error: "Le titre et la description sont requis." }, { status: 400 });
        }

        // Récupérer le bail (pour lier la requête à une propriété)
        const lease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: 'ACTIVE' },
            include: { property: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!lease || !lease.propertyId) {
            return NextResponse.json({ error: "Aucun bail actif pour lier ce signalement." }, { status: 400 });
        }

        // Créer l'enregistrement de maintenance
        const count = await prisma.ticketMaintenance.count();
        const ref = `MAI-${String(count + 1).padStart(4, '0')}`;
        
        const maintenance = await prisma.ticketMaintenance.create({
            data: {
                ticketRef: ref,
                logementId: lease.propertyId,
                leaseId: lease.id,
                locataireId: user.userId,
                description: `[${title}] ${description}`,
                categorie: category || 'MAI_AU',
                urgence: 'NORMALE',
            }
        });

        return NextResponse.json({
            success: true,
            message: "Votre signalement a été envoyé avec succès.",
            ticket: maintenance
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/maintenance POST error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
