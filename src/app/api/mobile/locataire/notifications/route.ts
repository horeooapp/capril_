import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        // 1. Récupérer les notifications standard
        const standardNotifs = await prisma.notification.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const formattedStandard = standardNotifs.map(n => ({
            id: n.id,
            title: n.title || 'Information',
            content: n.content,
            type: n.type || 'INFO', // INFO, ACTION, ALERT
            actionUrl: n.link,
            read: n.read,
            createdAt: n.createdAt
        }));

        // 2. Récupérer les baux formels et déclaratifs en attente pour en faire des notifications "ACTION"
        const [formalLeases, pendingDeclarations] = await Promise.all([
            prisma.lease.findMany({
                where: {
                    tenantId: user.userId,
                    status: 'PENDING_SIGNATURE',
                    deletedAt: null
                },
                include: { property: true }
            }),
            prisma.bailDeclaratif.findMany({
                where: {
                    locataireId: user.userId,
                    statut: 'PENDING_LOCATAIRE'
                },
                include: { property: true }
            })
        ]);

        const formattedFormalLeases = formalLeases.map(lease => ({
            id: `lease-formal-${lease.id}`,
            title: 'Contrat de bail prêt à signer',
            content: `Votre bail pour "${lease.property?.name || lease.property?.address || 'votre logement'}" attend votre signature et code de validation.`,
            type: 'ACTION',
            actionUrl: `/signature/${lease.id}`,
            read: false,
            createdAt: lease.createdAt
        }));

        const formattedDeclarations = pendingDeclarations.map(lease => ({
            id: `lease-dec-${lease.id}`,
            title: 'Nouveau Contrat de Bail',
            content: `Le propriétaire de "${lease.property?.name || 'votre logement'}" vous a envoyé un contrat de bail pour signature.`,
            type: 'ACTION',
            actionUrl: '/(tabs)/bail',
            read: false,
            createdAt: lease.createdAt
        }));

        // 3. Fusionner et trier
        const allNotifications = [...formattedFormalLeases, ...formattedDeclarations, ...formattedStandard].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // 4. Calculer le nombre non lues
        const unreadCount = allNotifications.filter(n => !n.read).length;

        return NextResponse.json({
            notifications: allNotifications,
            unreadCount
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/notifications error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
